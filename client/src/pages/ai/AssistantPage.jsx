import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  askAssistant, addUserMessage, clearChat,
  fetchMySummary, fetchStudentSummary, fetchAiStatus,
  draftAnnouncement, sendDraftedAnnouncement, clearDraft,
} from '../../features/ai/aiSlice';
import { fetchStudents } from '../../features/students/studentSlice';
import { PageHeader, Spinner, EmptyState } from '../../components/common';
import { MdSend, MdAutoAwesome, MdDelete, MdCampaign } from 'react-icons/md';

const starters = {
  student: [
    'How is my attendance looking this semester?',
    'Which course should I focus on next?',
    'How do I enrol in a new course?',
  ],
  faculty: [
    'How do I mark attendance for a class?',
    'What do the grade fields mean?',
    'How do I publish grades for a course?',
  ],
  admin: [
    'How do I approve a pending registration?',
    'Where do I assign faculty to a course?',
    'How do announcements reach students?',
  ],
};

const Bubble = ({ role, content }) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div
      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
        role === 'user'
          ? 'bg-primary-500 text-white rounded-br-sm'
          : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm'
      }`}
    >
      {content}
    </div>
  </div>
);

const AssistantPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { chat, summary, draft, loading, enabled } = useSelector((s) => s.ai);
  const { students } = useSelector((s) => s.students);

  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('');
  const [studentId, setStudentId] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    dispatch(fetchAiStatus());
    if (user?.role === 'admin' || user?.role === 'faculty') dispatch(fetchStudents({ limit: 100 }));
  }, [dispatch, user?.role]);

  // keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, loading]);

  const send = (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || loading) return;

    // send the previous turns so follow-up questions make sense
    const history = chat.slice(-6);
    dispatch(addUserMessage(trimmed));
    dispatch(askAssistant({ question: trimmed, history }));
    setQuestion('');
  };

  if (!enabled) {
    return (
      <div>
        <PageHeader title="Assistant" subtitle="AI help for your academic records" />
        <EmptyState
          title="AI features are switched off"
          description="Add an ANTHROPIC_API_KEY to the server .env file and restart the API to turn this on."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Assistant"
        subtitle="Ask about your records, or generate a summary"
        action={
          chat.length > 0 && (
            <button onClick={() => dispatch(clearChat())} className="btn-secondary flex items-center gap-1 text-sm">
              <MdDelete size={16} /> Clear chat
            </button>
          )
        }
      />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chat */}
        <div className="lg:col-span-2 card flex flex-col h-[520px]">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {chat.length === 0 && (
              <div className="text-sm text-gray-500 space-y-2">
                <p>Try one of these:</p>
                {(starters[user?.role] || starters.student).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full text-left border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {chat.map((m, i) => <Bubble key={i} role={m.role} content={m.content} />)}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="sm" /> Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(question)}
              placeholder="Ask a question..."
              className="input-field flex-1"
            />
            <button onClick={() => send(question)} disabled={loading} className="btn-primary flex items-center gap-1">
              <MdSend size={16} /> Send
            </button>
          </div>
        </div>

        {/* Side panel changes with the role */}
        <div className="space-y-4">
          {user?.role === 'student' && (
            <div className="card">
              <h3 className="font-semibold mb-2 flex items-center gap-1">
                <MdAutoAwesome size={18} /> My performance
              </h3>
              <button
                onClick={() => dispatch(fetchMySummary())}
                disabled={loading}
                className="btn-primary text-sm w-full"
              >
                Generate summary
              </button>
              {summary && <p className="text-sm text-gray-600 whitespace-pre-wrap mt-3">{summary.summary}</p>}
            </div>
          )}

          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <div className="card">
              <h3 className="font-semibold mb-2 flex items-center gap-1">
                <MdAutoAwesome size={18} /> Student summary
              </h3>
              <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input-field mb-2">
                <option value="">Pick a student</option>
                {(students || []).map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.userId?.name || s.studentId} — {s.studentId}
                  </option>
                ))}
              </select>
              <button
                onClick={() => studentId && dispatch(fetchStudentSummary(studentId))}
                disabled={!studentId || loading}
                className="btn-primary text-sm w-full"
              >
                Generate summary
              </button>
              {summary && <p className="text-sm text-gray-600 whitespace-pre-wrap mt-3">{summary.summary}</p>}
            </div>
          )}

          {user?.role === 'admin' && (
            <div className="card">
              <h3 className="font-semibold mb-2 flex items-center gap-1">
                <MdCampaign size={18} /> Announcement draft
              </h3>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. mid-sem exams start 12 Oct"
                className="input-field mb-2"
              />
              <button
                onClick={() => topic.trim() && dispatch(draftAnnouncement({ topic }))}
                disabled={loading}
                className="btn-primary text-sm w-full"
              >
                Write a draft
              </button>

              {draft && (
                <div className="mt-3 text-sm">
                  <p className="font-medium">{draft.title}</p>
                  <p className="text-gray-600 whitespace-pre-wrap mt-1">{draft.message}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => dispatch(sendDraftedAnnouncement({ title: draft.title, message: draft.message }))}
                      className="btn-primary text-sm flex-1"
                    >
                      Send to everyone
                    </button>
                    <button onClick={() => dispatch(clearDraft())} className="btn-secondary text-sm">
                      Discard
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-gray-400">
            Answers are generated from your own records. Check anything important against the
            grades and attendance pages.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssistantPage;
