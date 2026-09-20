import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchAiStatus = createAsyncThunk('ai/status', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/ai/status'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const askAssistant = createAsyncThunk('ai/ask', async ({ question, history }, { rejectWithValue }) => {
  try { const res = await api.post('/ai/ask', { question, history }); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message || 'Assistant is unavailable'); return rejectWithValue(err.response?.data?.message); }
});

export const fetchMySummary = createAsyncThunk('ai/mySummary', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/ai/me/summary'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message || 'Could not generate summary'); return rejectWithValue(err.response?.data?.message); }
});

export const fetchStudentSummary = createAsyncThunk('ai/studentSummary', async (studentId, { rejectWithValue }) => {
  try { const res = await api.get(`/ai/student/${studentId}/summary`); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message || 'Could not generate summary'); return rejectWithValue(err.response?.data?.message); }
});

export const draftAnnouncement = createAsyncThunk('ai/draftAnnouncement', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/ai/announcement/draft', data); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message || 'Could not write a draft'); return rejectWithValue(err.response?.data?.message); }
});

export const sendDraftedAnnouncement = createAsyncThunk('ai/sendAnnouncement', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/ai/announcement/send', data); toast.success('Announcement sent!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message || 'Could not send announcement'); return rejectWithValue(err.response?.data?.message); }
});

export const draftCourseDescription = createAsyncThunk('ai/courseDescription', async (courseId, { rejectWithValue }) => {
  try { const res = await api.post(`/ai/course/${courseId}/description`); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message || 'Could not write a description'); return rejectWithValue(err.response?.data?.message); }
});

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    enabled: false,
    model: null,
    chat: [],          // { role: 'user' | 'assistant', content }
    summary: null,
    draft: null,
    loading: false,
    error: null,
  },
  reducers: {
    addUserMessage: (s, a) => { s.chat.push({ role: 'user', content: a.payload }); },
    clearChat: (s) => { s.chat = []; },
    clearDraft: (s) => { s.draft = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAiStatus.fulfilled, (s, a) => { s.enabled = a.payload.enabled; s.model = a.payload.model; })
      .addCase(fetchAiStatus.rejected, (s) => { s.enabled = false; })
      .addCase(askAssistant.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(askAssistant.fulfilled, (s, a) => {
        s.loading = false;
        s.chat.push({ role: 'assistant', content: a.payload.answer });
      })
      .addCase(askAssistant.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMySummary.pending, (s) => { s.loading = true; })
      .addCase(fetchMySummary.fulfilled, (s, a) => { s.loading = false; s.summary = a.payload; })
      .addCase(fetchMySummary.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchStudentSummary.pending, (s) => { s.loading = true; })
      .addCase(fetchStudentSummary.fulfilled, (s, a) => { s.loading = false; s.summary = a.payload; })
      .addCase(fetchStudentSummary.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(draftAnnouncement.pending, (s) => { s.loading = true; })
      .addCase(draftAnnouncement.fulfilled, (s, a) => { s.loading = false; s.draft = a.payload; })
      .addCase(draftAnnouncement.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(sendDraftedAnnouncement.fulfilled, (s) => { s.draft = null; })
      .addCase(draftCourseDescription.pending, (s) => { s.loading = true; })
      .addCase(draftCourseDescription.fulfilled, (s) => { s.loading = false; })
      .addCase(draftCourseDescription.rejected, (s) => { s.loading = false; });
  },
});

export const { addUserMessage, clearChat, clearDraft } = aiSlice.actions;
export default aiSlice.reducer;
