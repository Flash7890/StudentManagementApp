import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchMyEnrollments = createAsyncThunk('enrollment/fetchMine', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/enrollments/me'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchStudentEnrollments = createAsyncThunk('enrollment/fetchStudent', async (studentId, { rejectWithValue }) => {
  try { const res = await api.get(`/enrollments/student/${studentId}`); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchCourseEnrollments = createAsyncThunk('enrollment/fetchCourse', async (courseId, { rejectWithValue }) => {
  try { const res = await api.get(`/enrollments/course/${courseId}`); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const enrollInCourse = createAsyncThunk('enrollment/enroll', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/enrollments', data); toast.success('Enrolled successfully!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

export const dropEnrollment = createAsyncThunk('enrollment/drop', async (id, { rejectWithValue }) => {
  try { const res = await api.patch(`/enrollments/${id}/drop`); toast.success('Enrollment dropped'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

const enrollmentSlice = createSlice({
  name: 'enrollment',
  initialState: { myEnrollments: [], studentEnrollments: [], courseEnrollments: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyEnrollments.pending, (s) => { s.loading = true; })
      .addCase(fetchMyEnrollments.fulfilled, (s, a) => { s.loading = false; s.myEnrollments = a.payload; })
      .addCase(fetchMyEnrollments.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchStudentEnrollments.fulfilled, (s, a) => { s.studentEnrollments = a.payload; })
      .addCase(fetchCourseEnrollments.fulfilled, (s, a) => { s.courseEnrollments = a.payload; })
      .addCase(enrollInCourse.fulfilled, (s, a) => { s.myEnrollments.unshift(a.payload); })
      .addCase(dropEnrollment.fulfilled, (s, a) => {
        s.myEnrollments = s.myEnrollments.map(e => e._id === a.payload._id ? a.payload : e);
      });
  },
});

export default enrollmentSlice.reducer;