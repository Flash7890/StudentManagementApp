import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchMyGrades = createAsyncThunk('grades/fetchMine', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/grades/me'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMyTranscript = createAsyncThunk('grades/fetchTranscript', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/grades/me/transcript'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchCourseGrades = createAsyncThunk('grades/fetchCourse', async (courseId, { rejectWithValue }) => {
  try { const res = await api.get(`/grades/course/${courseId}`); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const assignGrade = createAsyncThunk('grades/assign', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/grades/assign', data); toast.success('Grade assigned!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

export const publishGrades = createAsyncThunk('grades/publish', async (courseId, { rejectWithValue }) => {
  try { await api.patch(`/grades/course/${courseId}/publish`); toast.success('Grades published!'); return courseId; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

const gradeSlice = createSlice({
  name: 'grades',
  initialState: { myGrades: [], transcript: null, courseGrades: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyGrades.pending, (s) => { s.loading = true; })
      .addCase(fetchMyGrades.fulfilled, (s, a) => { s.loading = false; s.myGrades = a.payload; })
      .addCase(fetchMyGrades.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMyTranscript.fulfilled, (s, a) => { s.transcript = a.payload; })
      .addCase(fetchCourseGrades.fulfilled, (s, a) => { s.courseGrades = a.payload; })
      .addCase(assignGrade.fulfilled, (s, a) => {
        const idx = s.courseGrades.findIndex(g => g._id === a.payload._id);
        if (idx >= 0) s.courseGrades[idx] = a.payload; else s.courseGrades.push(a.payload);
      });
  },
});

export default gradeSlice.reducer;