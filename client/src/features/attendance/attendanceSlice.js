import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchMyAttendance = createAsyncThunk('attendance/fetchMine', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/attendance/me', { params }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMyAttendanceSummary = createAsyncThunk('attendance/fetchSummary', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/attendance/me/summary'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchCourseAttendance = createAsyncThunk('attendance/fetchCourse', async ({ courseId, date }, { rejectWithValue }) => {
  try { const res = await api.get(`/attendance/course/${courseId}`, { params: { date } }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markAttendance = createAsyncThunk('attendance/mark', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/attendance/mark', data); toast.success('Attendance marked!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: { myAttendance: [], summary: [], courseAttendance: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAttendance.pending, (s) => { s.loading = true; })
      .addCase(fetchMyAttendance.fulfilled, (s, a) => { s.loading = false; s.myAttendance = a.payload; })
      .addCase(fetchMyAttendance.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMyAttendanceSummary.fulfilled, (s, a) => { s.summary = a.payload; })
      .addCase(fetchCourseAttendance.fulfilled, (s, a) => { s.courseAttendance = a.payload; })
      .addCase(markAttendance.fulfilled, (s, a) => { s.courseAttendance = a.payload; });
  },
});

export default attendanceSlice.reducer;