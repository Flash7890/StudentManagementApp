/**
 * USMS Full Seed Script — node src/seed.js
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose   = require('mongoose');
const User       = require('./models/User');
const Student    = require('./models/Student');
const Faculty    = require('./models/Faculty');
const Course     = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Grade      = require('./models/Grade');
const Timetable  = require('./models/Timetable');
const Attendance = require('./models/Attendance');
const Notification       = require('./models/Notification');
const PendingRegistration = require('./models/PendingRegistration');

const MONGO_URI    = process.env.MONGO_URI;
const ACADEMIC_YEAR = '2024-2025';

// ── helpers ──────────────────────────────────────────────────────────────────
const rand  = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const randF = (a, b) => Math.random() * (b - a) + a;
const pick  = (a)    => a[rand(0, a.length - 1)];
const slug  = (s)    => s.toLowerCase().replace(/\s+/g, '');

// Weighted random: weights[] must sum to 1, returns index
function weightedIdx(weights) {
  let r = Math.random(), sum = 0;
  for (let i = 0; i < weights.length; i++) { sum += weights[i]; if (r < sum) return i; }
  return weights.length - 1;
}

// Skewed int: bias towards lower or higher values using beta-like distortion
function skewedRand(min, max, skew = 1) {
  const u = Math.pow(Math.random(), skew);
  return Math.round(min + u * (max - min));
}

function calcGrade(t) {
  if (t >= 95) return { grade: 'A+', gp: 4.0 }; if (t >= 90) return { grade: 'A',  gp: 4.0 };
  if (t >= 85) return { grade: 'A-', gp: 3.7 }; if (t >= 80) return { grade: 'B+', gp: 3.3 };
  if (t >= 75) return { grade: 'B',  gp: 3.0 }; if (t >= 70) return { grade: 'B-', gp: 2.7 };
  if (t >= 65) return { grade: 'C+', gp: 2.3 }; if (t >= 60) return { grade: 'C',  gp: 2.0 };
  if (t >= 55) return { grade: 'C-', gp: 1.7 }; if (t >= 50) return { grade: 'D+', gp: 1.3 };
  if (t >= 45) return { grade: 'D',  gp: 1.0 }; return { grade: 'F', gp: 0.0 };
}

function pastClassDates(n = 60) {
  const dates = []; let d = new Date();
  while (dates.length < n) { d = new Date(d.getTime() - 86400000); if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(new Date(d)); }
  return dates.reverse();
}

// ── static data ───────────────────────────────────────────────────────────────
const DEPARTMENTS = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Business Administration', 'Mathematics'];

// Per-department student counts — deliberately uneven
const DEPT_STUDENT_COUNT = {
  'Computer Science':        rand(52, 68),
  'Electrical Engineering':  rand(28, 38),
  'Mechanical Engineering':  rand(18, 26),
  'Business Administration': rand(38, 52),
  'Mathematics':             rand(12, 20),
};

// Per-department faculty counts — uneven
const DEPT_FACULTY_COUNT = {
  'Computer Science':        rand(12, 16),
  'Electrical Engineering':  rand(7, 10),
  'Mechanical Engineering':  rand(5, 8),
  'Business Administration': rand(8, 12),
  'Mathematics':             rand(4, 7),
};

const DEPT_COURSES = {
  'Computer Science': [
    { title: 'Data Structures & Algorithms', code: 'CS201', credits: 4, sem: 3 },
    { title: 'Operating Systems',            code: 'CS301', credits: 4, sem: 5 },
    { title: 'Database Management Systems',  code: 'CS302', credits: 3, sem: 5 },
    { title: 'Computer Networks',            code: 'CS401', credits: 3, sem: 7 },
    { title: 'Machine Learning',             code: 'CS501', credits: 4, sem: 7 },
    { title: 'Web Development',              code: 'CS203', credits: 3, sem: 3 },
    { title: 'Software Engineering',         code: 'CS303', credits: 3, sem: 5 },
    { title: 'Artificial Intelligence',      code: 'CS502', credits: 4, sem: 7 },
    { title: 'Cloud Computing',              code: 'CS601', credits: 3, sem: 8 },
    { title: 'Cybersecurity Fundamentals',   code: 'CS602', credits: 3, sem: 8 },
  ],
  'Electrical Engineering': [
    { title: 'Circuit Theory',              code: 'EE101', credits: 4, sem: 1 },
    { title: 'Signals & Systems',           code: 'EE201', credits: 4, sem: 3 },
    { title: 'Digital Electronics',         code: 'EE202', credits: 3, sem: 3 },
    { title: 'Power Systems',               code: 'EE301', credits: 4, sem: 5 },
    { title: 'Control Systems',             code: 'EE302', credits: 4, sem: 5 },
    { title: 'Electromagnetic Theory',      code: 'EE303', credits: 3, sem: 5 },
    { title: 'Microprocessors',             code: 'EE401', credits: 3, sem: 7 },
    { title: 'VLSI Design',                 code: 'EE501', credits: 3, sem: 7 },
    { title: 'Renewable Energy Systems',    code: 'EE601', credits: 3, sem: 8 },
    { title: 'Embedded Systems',            code: 'EE602', credits: 3, sem: 8 },
  ],
  'Mechanical Engineering': [
    { title: 'Engineering Mechanics',       code: 'ME101', credits: 4, sem: 1 },
    { title: 'Thermodynamics',              code: 'ME201', credits: 4, sem: 3 },
    { title: 'Fluid Mechanics',             code: 'ME202', credits: 4, sem: 3 },
    { title: 'Manufacturing Processes',     code: 'ME301', credits: 3, sem: 5 },
    { title: 'Machine Design',              code: 'ME302', credits: 4, sem: 5 },
    { title: 'Heat Transfer',               code: 'ME303', credits: 3, sem: 5 },
    { title: 'CAD/CAM',                     code: 'ME401', credits: 3, sem: 7 },
    { title: 'Robotics & Automation',       code: 'ME501', credits: 3, sem: 7 },
    { title: 'Industrial Engineering',      code: 'ME601', credits: 3, sem: 8 },
    { title: 'Automotive Engineering',      code: 'ME602', credits: 3, sem: 8 },
  ],
  'Business Administration': [
    { title: 'Principles of Management',    code: 'BA101', credits: 3, sem: 1 },
    { title: 'Financial Accounting',        code: 'BA201', credits: 3, sem: 3 },
    { title: 'Marketing Management',        code: 'BA202', credits: 3, sem: 3 },
    { title: 'Human Resource Management',   code: 'BA301', credits: 3, sem: 5 },
    { title: 'Business Analytics',          code: 'BA302', credits: 3, sem: 5 },
    { title: 'Corporate Finance',           code: 'BA303', credits: 4, sem: 5 },
    { title: 'Strategic Management',        code: 'BA401', credits: 3, sem: 7 },
    { title: 'Entrepreneurship',            code: 'BA501', credits: 3, sem: 7 },
    { title: 'Supply Chain Management',     code: 'BA601', credits: 3, sem: 8 },
    { title: 'International Business',      code: 'BA602', credits: 3, sem: 8 },
  ],
  'Mathematics': [
    { title: 'Calculus I',                  code: 'MA101', credits: 4, sem: 1 },
    { title: 'Calculus II',                 code: 'MA102', credits: 4, sem: 2 },
    { title: 'Linear Algebra',              code: 'MA201', credits: 4, sem: 3 },
    { title: 'Differential Equations',      code: 'MA202', credits: 3, sem: 3 },
    { title: 'Probability & Statistics',    code: 'MA301', credits: 3, sem: 5 },
    { title: 'Numerical Methods',           code: 'MA302', credits: 3, sem: 5 },
    { title: 'Abstract Algebra',            code: 'MA401', credits: 4, sem: 7 },
    { title: 'Real Analysis',               code: 'MA402', credits: 4, sem: 7 },
    { title: 'Complex Analysis',            code: 'MA501', credits: 3, sem: 8 },
    { title: 'Topology',                    code: 'MA601', credits: 3, sem: 8 },
  ],
};

const DEPT_SPEC = {
  'Computer Science':        ['Algorithms', 'Networking', 'AI/ML', 'Systems', 'Security'],
  'Electrical Engineering':  ['Power', 'Signal Processing', 'VLSI', 'Control', 'Embedded'],
  'Mechanical Engineering':  ['Thermodynamics', 'Fluid Dynamics', 'Manufacturing', 'Robotics', 'CAD'],
  'Business Administration': ['Finance', 'Marketing', 'HR', 'Strategy', 'Analytics'],
  'Mathematics':             ['Algebra', 'Analysis', 'Statistics', 'Topology', 'Numerical Methods'],
};

const DESIGNATIONS   = ['Assistant Professor', 'Associate Professor', 'Professor', 'Senior Lecturer'];
// Realistic designation distribution: most are Assistant/Associate, few full Professors
const DESIGNATION_WEIGHTS = [0.40, 0.30, 0.15, 0.15];

const PROGRAMS = { 'Computer Science': 'B.Tech', 'Electrical Engineering': 'B.Tech', 'Mechanical Engineering': 'B.Tech', 'Business Administration': 'MBA', 'Mathematics': 'B.Sc' };
const BATCHES  = { 'B.Tech': ['2021-2025', '2022-2026', '2023-2027', '2024-2028'], 'MBA': ['2022-2024', '2023-2025', '2024-2026'], 'B.Sc': ['2022-2025', '2023-2026', '2024-2027'] };

// Batch weights: newer batches have more students (growing intake)
const BATCH_WEIGHTS_BTECH = [0.15, 0.20, 0.28, 0.37];
const BATCH_WEIGHTS_OTHER = [0.20, 0.35, 0.45];

const FN = ['Aarav','Aisha','Arjun','Ananya','Rahul','Priya','Rohit','Sneha','Vikram','Kavya','Karan','Divya','Nikhil','Pooja','Sanjay','Meera','Ravi','Nisha','Amit','Sunita','Deepak','Rekha','Suresh','Geeta','Manish','Sonia','Arun','Neha','Vijay','Asha','Gaurav','Swati','Ajay','Ritu','Vinod','Shilpa','Rakesh','Poonam','Harish','Seema','Sachin','Usha','Bharat','Sarita','Mukesh','Vandana','Alok','Shweta','Pankaj','Anita','Tarun','Mamta','Girish','Kavita','Hemant','Sapna','Satish','Jyoti','Naresh','Manju','Vishal','Reena','Manoj','Radha','Kuldeep','Pushpa','Sanjeev','Lata','Preeti','Kapil'];
const LN = ['Sharma','Verma','Gupta','Singh','Kumar','Patel','Mehta','Joshi','Yadav','Mishra','Tiwari','Pandey','Dubey','Chauhan','Rao','Reddy','Nair','Menon','Iyer','Bhat','Desai','Shah','Modi','Kapoor','Malhotra','Khanna','Arora','Chopra','Sethi','Bose'];
const CITIES = ['Delhi','Mumbai','Pune','Bangalore','Hyderabad','Chennai','Kolkata','Jaipur','Lucknow','Bhopal'];
const STATES  = ['Uttar Pradesh','Maharashtra','Karnataka','Tamil Nadu','West Bengal','Rajasthan','Delhi','Gujarat'];
const DAYS    = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const SLOTS   = [{s:'08:00',e:'09:00'},{s:'09:00',e:'10:00'},{s:'10:00',e:'11:00'},{s:'11:00',e:'12:00'},{s:'13:00',e:'14:00'},{s:'14:00',e:'15:00'},{s:'15:00',e:'16:00'},{s:'16:00',e:'17:00'}];
const ROOMS   = ['A101','A102','A103','B201','B202','B203','C301','C302','C303','LAB1','LAB2','LAB3'];

let nc = 0;
function nextName() {
  const f = FN[nc % FN.length];
  const l = LN[Math.floor(nc / FN.length) % LN.length];
  nc++;
  return `${f} ${l}`;
}

// Pick a batch index using weights
function pickBatch(prog) {
  const bList    = BATCHES[prog];
  const weights  = prog === 'B.Tech' ? BATCH_WEIGHTS_BTECH : BATCH_WEIGHTS_OTHER;
  return bList[weightedIdx(weights)];
}

// Generate a realistic (non-uniform) score for a student in a course.
// Each student has a hidden "ability" factor that biases all their scores.
// Course difficulty also shifts the distribution.
function studentScore(ability, courseDifficulty) {
  // ability: 0–1 (student talent, seeded per student)
  // courseDifficulty: 0–1 (higher = harder)
  const base = ability * 55 + 35; // maps 0–1 ability to 35–90 base score
  const diffPenalty = courseDifficulty * 15;
  const noise = (Math.random() - 0.5) * 20; // ±10 random noise
  return Math.min(100, Math.max(30, Math.round(base - diffPenalty + noise)));
}

// ── main ──────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected');

  await Promise.all([User, Student, Faculty, Course, Enrollment, Grade, Timetable, Attendance, Notification, PendingRegistration].map(M => M.deleteMany({})));
  console.log('Cleared');

  // ── Admin ──
  await User.create({ name: 'Admin User', email: 'admin@usms.com', password: 'Admin@123', role: 'admin', isActive: true, isEmailVerified: true });
  console.log('Admin: admin@usms.com / Admin@123');

  // ── Faculty (variable per dept) ──
  console.log('Creating faculty...');
  const allFaculty = [];
  let fc = 1;
  for (const dept of DEPARTMENTS) {
    const count = DEPT_FACULTY_COUNT[dept];
    for (let i = 0; i < count; i++) {
      const name    = nextName();
      const desig   = DESIGNATIONS[weightedIdx(DESIGNATION_WEIGHTS)];
      const expMin  = desig === 'Professor' ? 12 : desig === 'Associate Professor' ? 6 : 1;
      const expMax  = desig === 'Professor' ? 30 : desig === 'Associate Professor' ? 15 : 8;
      const uDoc    = await User.create({ name, email: `${slug(name.split(' ')[0])}.f${fc}@usms.com`, password: 'Faculty@123', role: 'faculty', isActive: true, isEmailVerified: true });
      const fDoc    = await Faculty.create({
        userId: uDoc._id, facultyId: `FAC${String(fc).padStart(4, '0')}`, department: dept,
        designation: desig, specialization: [pick(DEPT_SPEC[dept])],
        qualification: pick(['Ph.D', 'M.Tech', 'M.Sc', 'MBA']), experience: rand(expMin, expMax),
        joinDate: new Date(2010 + rand(0, 12), rand(0, 11), rand(1, 28)),
        gender: pick(['male', 'female']), phone: `9${rand(100000000, 999999999)}`, status: 'active',
      });
      await PendingRegistration.create({ userId: uDoc._id, role: 'faculty', department: dept, phone: fDoc.phone, gender: fDoc.gender, designation: fDoc.designation, qualification: fDoc.qualification, experience: fDoc.experience, emailVerified: true, status: 'approved' });
      allFaculty.push({ fDoc, uDoc, dept });
      fc++;
    }
  }
  console.log(`${allFaculty.length} faculty done`);

  // ── Courses — assign faculty round-robin within dept ──
  console.log('Creating courses...');
  const allCourses = [];
  const facultyByDept = {};
  for (const dept of DEPARTMENTS) {
    facultyByDept[dept] = allFaculty.filter(f => f.dept === dept);
  }
  let courseIdx = {}; DEPARTMENTS.forEach(d => courseIdx[d] = 0);

  for (const dept of DEPARTMENTS) {
    for (const cd of DEPT_COURSES[dept]) {
      const dFaculty = facultyByDept[dept];
      const { fDoc, uDoc } = dFaculty[courseIdx[dept] % dFaculty.length];
      courseIdx[dept]++;

      // Random capacity: popular courses larger, niche ones smaller
      const maxStudents = pick([30, 35, 40, 45, 50, 55, 60]);

      const nSlots = rand(2, 3); const usedDays = new Set(); const schedule = [];
      while (schedule.length < nSlots) {
        const day = pick(DAYS); if (usedDays.has(day)) continue;
        usedDays.add(day); const sl = pick(SLOTS);
        schedule.push({ day, startTime: sl.s, endTime: sl.e, room: pick(ROOMS) });
      }
      const course = await Course.create({
        ...cd, department: dept,
        description: `${dept} course covering ${cd.title} fundamentals and advanced topics.`,
        maxStudents, faculty: fDoc._id, status: 'active', schedule,
      });
      await Faculty.findByIdAndUpdate(fDoc._id, { $push: { assignedCourses: course._id } });

      // Each course gets a difficulty factor used later for grade generation
      allCourses.push({ course, fDoc, uDoc, difficulty: parseFloat(randF(0.1, 0.9).toFixed(2)) });
    }
  }
  console.log(`${allCourses.length} courses done`);

  // ── Students (variable count, uneven batches) ──
  console.log('Creating students...');
  const allStudents = [];
  let sc = 1;
  for (const dept of DEPARTMENTS) {
    const prog   = PROGRAMS[dept];
    const count  = DEPT_STUDENT_COUNT[dept];
    for (let i = 0; i < count; i++) {
      const name    = nextName();
      const batch   = pickBatch(prog);
      // Semester: skew so more students are in mid-semesters (3–6), fewer in 1 or 8
      const semWeights = [0.08, 0.10, 0.18, 0.18, 0.16, 0.14, 0.10, 0.06];
      const sem = 1 + weightedIdx(semWeights);
      const ability = parseFloat(randF(0, 1).toFixed(3)); // student talent level (fixed per student)
      const uDoc    = await User.create({ name, email: `${slug(name.split(' ')[0])}.s${sc}@usms.com`, password: 'Student@123', role: 'student', isActive: true, isEmailVerified: true });
      const sDoc    = await Student.create({
        userId: uDoc._id, studentId: `STU${String(sc).padStart(5, '0')}`,
        department: dept, program: prog, semester: sem, batch,
        enrollmentYear: parseInt(batch.split('-')[0]),
        gender: pick(['male', 'female']),
        dateOfBirth: new Date(2000 + rand(0, 5), rand(0, 11), rand(1, 28)),
        phone: `8${rand(100000000, 999999999)}`,
        address: { city: pick(CITIES), state: pick(STATES), country: 'India' },
        guardian: { name: nextName(), relation: pick(['Father', 'Mother', 'Guardian']), phone: `7${rand(100000000, 999999999)}` },
        status: 'active', cgpa: 0, totalCredits: 0,
      });
      await PendingRegistration.create({ userId: uDoc._id, role: 'student', department: dept, phone: sDoc.phone, gender: sDoc.gender, dateOfBirth: sDoc.dateOfBirth, program: prog, semester: sem, batch, enrollmentYear: parseInt(batch.split('-')[0]), emailVerified: true, status: 'approved' });
      allStudents.push({ sDoc, uDoc, dept, ability });
      sc++;
    }
  }
  console.log(`${allStudents.length} students done`);

  // ── Timetable ──
  console.log('Creating timetable...');
  const ttEntries = [];
  for (const { course, fDoc } of allCourses) {
    for (const sl of course.schedule) {
      ttEntries.push({ course: course._id, faculty: fDoc._id, day: sl.day, startTime: sl.startTime, endTime: sl.endTime, room: sl.room, department: course.department, semester: course.semester, academicYear: ACADEMIC_YEAR });
    }
  }
  await Timetable.insertMany(ttEntries);
  console.log(`${ttEntries.length} timetable slots done`);

  // ── Enrollments + Grades + Attendance ──
  console.log('Creating enrollments, grades, attendance (slow)...');
  const classDates = pastClassDates(60);
  let te = 0, tg = 0, ta = 0;

  for (const { course, fDoc, uDoc: fUser, difficulty } of allCourses) {
    const sameDept  = allStudents.filter(s => s.dept === course.department).sort(() => Math.random() - 0.5);
    const otherDept = allStudents.filter(s => s.dept !== course.department).sort(() => Math.random() - 0.5);

    // Random cohort size: between 15 and course.maxStudents — intentionally uneven
    const targetSize = rand(Math.max(10, Math.floor(course.maxStudents * 0.3)), course.maxStudents);
    // Mostly same-dept students, some cross-dept depending on course
    const crossEnrollRatio = randF(0.0, 0.25);
    const crossCount  = Math.floor(targetSize * crossEnrollRatio);
    const sameCount   = targetSize - crossCount;
    const cohort      = [...sameDept.slice(0, sameCount), ...otherDept.slice(0, crossCount)];

    const eDocs    = cohort.map(({ sDoc }) => ({ student: sDoc._id, course: course._id, semester: course.semester, academicYear: ACADEMIC_YEAR, status: 'active', enrolledAt: new Date(Date.now() - rand(30, 90) * 86400000) }));
    let inserted   = [];
    try { inserted = await Enrollment.insertMany(eDocs, { ordered: false }); } catch (e) { inserted = e.insertedDocs || []; }
    te += inserted.length;

    const gDocs = []; const aDocs = [];
    const scheduleDays = new Set(course.schedule.map(s => s.day));
    const studentAbilityMap = {};
    for (const s of cohort) studentAbilityMap[s.sDoc._id.toString()] = s.ability;

    for (const enr of inserted) {
      const ability  = studentAbilityMap[enr.student.toString()] ?? 0.5;
      const internal = studentScore(ability, difficulty * 0.5);   // internals slightly easier
      const midterm  = studentScore(ability, difficulty * 0.75);
      const final_   = studentScore(ability, difficulty);
      const total    = Math.round(internal * 0.2 + midterm * 0.3 + final_ * 0.5);
      const { grade, gp } = calcGrade(total);
      gDocs.push({ student: enr.student, course: course._id, enrollment: enr._id, internal, midterm, final: final_, total, grade, gradePoints: gp, semester: course.semester, academicYear: ACADEMIC_YEAR, isPublished: true, gradedBy: fUser._id });

      // Attendance: diligent students (high ability) miss fewer classes
      const absenceRate = parseFloat(randF(0.02, 0.25 - ability * 0.15).toFixed(3));
      const lateRate    = parseFloat(randF(0.02, 0.12).toFixed(3));

      for (const date of classDates) {
        if (!scheduleDays.has(DAY_NAMES[date.getDay()])) continue;
        const r = Math.random();
        const status = r < absenceRate ? 'absent' : r < absenceRate + lateRate ? 'late' : 'present';
        aDocs.push({ student: enr.student, course: course._id, date, status, markedBy: fUser._id });
      }
    }

    try { await Grade.insertMany(gDocs, { ordered: false }); tg += gDocs.length; } catch (e) { tg += (e.insertedDocs || []).length; }
    for (let i = 0; i < aDocs.length; i += 500) {
      const chunk = aDocs.slice(i, i + 500);
      try { await Attendance.insertMany(chunk, { ordered: false }); ta += chunk.length; } catch (e) { ta += (e.insertedDocs || []).length; }
    }
  }
  console.log(`${te} enrollments, ${tg} grades, ${ta} attendance records`);

  // ── Update CGPAs ──
  console.log('Updating CGPAs...');
  for (const { sDoc } of allStudents) {
    const grades = await Grade.find({ student: sDoc._id, isPublished: true }).populate('course', 'credits');
    if (!grades.length) continue;
    let tp = 0, tc = 0;
    for (const g of grades) { const cr = g.course?.credits || 3; tp += g.gradePoints * cr; tc += cr; }
    await Student.findByIdAndUpdate(sDoc._id, { cgpa: tc ? parseFloat((tp / tc).toFixed(2)) : 0, totalCredits: tc });
  }

  const totalStudents = Object.values(DEPT_STUDENT_COUNT).reduce((a, b) => a + b, 0);
  const totalFaculty  = Object.values(DEPT_FACULTY_COUNT).reduce((a, b) => a + b, 0);

  console.log(`
╔═══════════════════════════════════════════════════╗
║              SEED COMPLETE                        ║
╠═══════════════════════════════════════════════════╣
║  admin@usms.com        → Admin@123                ║
║  <name>.fN@usms.com    → Faculty@123              ║
║  <name>.sN@usms.com    → Student@123              ║
╠═══════════════════════════════════════════════════╣
║  5 Departments  │ 50 Courses                      ║
║  ~${totalFaculty} Faculty (uneven)  │ ~${totalStudents} Students (uneven) ║
║  Variable cohort sizes │ Ability-based grades     ║
╚═══════════════════════════════════════════════════╝`);

  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });