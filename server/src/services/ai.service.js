const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const gradeService = require('./grade.service');
const attendanceService = require('./attendance.service');

const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const isConfigured = () => Boolean(process.env.GROQ_API_KEY) && process.env.AI_ENABLED !== 'false';

/**
 * Low-level call to the model. Everything else in this file goes through here
 * so prompts, errors and logging stay in one place.
 *
 * Groq speaks the OpenAI chat-completions format: plain {role, content}
 * messages, a Bearer token, and the reply sits at choices[0].message.content.
 */
const complete = async ({ system, messages }) => {
  if (!isConfigured()) {
    throw new ApiError(503, 'AI features are not configured on this server');
  }

  const chatMessages = [
    ...(system ? [{ role: 'system', content: system }] : []),
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: chatMessages,
        max_tokens: Number(process.env.AI_MAX_TOKENS) || 800,
      }),
    });
  } catch (err) {
    logger.error(`AI request failed: ${err.message}`);
    throw new ApiError(502, 'Could not reach the AI service');
  }

  if (!res.ok) {
    const body = await res.text();
    logger.error(`AI service returned ${res.status}: ${body}`);
    if (res.status === 429) throw new ApiError(429, 'AI service is busy, try again in a moment');
    throw new ApiError(502, 'AI service returned an error');
  }

  const data = await res.json();
  const text = (data.choices?.[0]?.message?.content || '').trim();

  if (!text) throw new ApiError(502, 'AI service returned an empty response');
  return text;
};

/** Collects the academic record we are allowed to show for one student. */
const buildStudentContext = async (studentId) => {
  const student = await Student.findById(studentId).populate('userId', 'name email').lean();
  if (!student) throw new ApiError(404, 'Student not found');

  const [grades, attendance, enrollments] = await Promise.all([
    gradeService.getStudentGrades(studentId),
    attendanceService.getStudentAttendanceSummary(studentId),
    Enrollment.find({ student: studentId, status: 'active' }).populate('course', 'title code credits').lean(),
  ]);

  return {
    name: student.userId?.name,
    department: student.department,
    program: student.program,
    semester: student.semester,
    cgpa: student.cgpa,
    totalCredits: student.totalCredits,
    courses: enrollments.map((e) => ({
      code: e.course?.code,
      title: e.course?.title,
      credits: e.course?.credits,
    })),
    grades: (grades || []).map((g) => ({
      course: g.course?.code || g.course?.title,
      total: g.total,
      grade: g.grade,
      gradePoints: g.gradePoints,
    })),
    attendance: (attendance || []).map((a) => ({
      course: a.course?.code || a.course?.title,
      classesHeld: a.total,
      present: a.present,
      percentage: a.percentage,
    })),
  };
};

/**
 * Written feedback on one student's academic record.
 * Used on the student detail page and on the student's own dashboard.
 */
const summarizeStudentPerformance = async (studentId) => {
  const context = await buildStudentContext(studentId);

  const summary = await complete({
    system:
      'You are an academic advisor inside a university management system. ' +
      'Write a short performance summary for the student record given as JSON. ' +
      'Use four labelled sections: Overview, Strengths, Needs attention, Suggested next steps. ' +
      'Keep it under 200 words, plain text, no markdown headings. ' +
      'Only use the data provided — never invent marks, courses or attendance figures. ' +
      'Stay factual and encouraging, and do not compare the student to anyone else.',
    messages: [{ role: 'user', content: JSON.stringify(context) }],
  });

  return { studentId, summary, generatedAt: new Date() };
};

/** Turns a one-line idea from an admin into a ready-to-send announcement. */
const draftAnnouncement = async ({ topic, audience = 'all students and faculty', tone = 'professional' }) => {
  if (!topic || topic.trim().length < 3) {
    throw new ApiError(400, 'Describe the announcement in a few words first');
  }

  const text = await complete({
    system:
      'You write announcements for a university notice board. ' +
      'Return JSON only, no markdown fences, shaped as {"title": string, "message": string}. ' +
      'Title under 60 characters. Message under 120 words, plain text, no placeholders like [date] ' +
      'unless the request itself is missing that detail.',
    messages: [
      { role: 'user', content: `Topic: ${topic}\nAudience: ${audience}\nTone: ${tone}` },
    ],
  });

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (err) {
    // if the model ever answers in prose, still give the caller something usable
    return { title: topic.slice(0, 60), message: text };
  }
};

/** Draft a course description for the course form. */
const draftCourseDescription = async (courseId) => {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new ApiError(404, 'Course not found');

  const description = await complete({
    system:
      'You write university course catalogue entries. Return one paragraph of plain text, ' +
      'under 90 words, describing what the course covers and what a student will be able to do ' +
      'after finishing it. No bullet points, no headings, no marketing language.',
    messages: [
      {
        role: 'user',
        content: `Course: ${course.title} (${course.code}), department ${course.department}, ${course.credits} credits, semester ${course.semester}.`,
      },
    ],
  });

  return { courseId, description };
};

/**
 * Q&A assistant. The caller's own data is passed as context, so a student can
 * only ever ask questions about their own record.
 */
const askAssistant = async ({ question, role, studentId, history = [] }) => {
  if (!question || question.trim().length < 2) {
    throw new ApiError(400, 'Ask a question first');
  }

  let context = null;
  if (studentId) context = await buildStudentContext(studentId);

  const messages = [
    ...history
      .slice(-6) // keep the last few turns so replies stay in context but prompts stay small
      .filter((m) => m && m.content)
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content) })),
    {
      role: 'user',
      content: context ? `${question}\n\nMy record:\n${JSON.stringify(context)}` : question,
    },
  ];

  const answer = await complete({
    system:
      `You are the assistant inside a university student management system. The person asking is a ${role}. ` +
      'Answer questions about attendance, grades, courses and how to use the system. ' +
      'If record data is included in the message, answer only from that data and say so when something is missing. ' +
      'Never guess marks, attendance or deadlines. Keep answers under 150 words. ' +
      'You cannot change any record — if asked to, explain which page in the app does it.',
    messages,
  });

  return { answer, generatedAt: new Date() };
};

module.exports = {
  isConfigured,
  summarizeStudentPerformance,
  draftAnnouncement,
  draftCourseDescription,
  askAssistant,
};
