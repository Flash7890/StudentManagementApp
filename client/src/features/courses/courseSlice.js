import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchCourses = createAsyncThunk('courses/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/courses', { params }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchCourseById = createAsyncThunk('courses/fetchById', async (id, { rejectWithValue }) => {
  try { const res = await api.get(`/courses/${id}`); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createCourse = createAsyncThunk('courses/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/courses', data); toast.success('Course created!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

export const updateCourse = createAsyncThunk('courses/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.patch(`/courses/${id}`, data); toast.success('Course updated!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

export const deleteCourse = createAsyncThunk('courses/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/courses/${id}`); toast.success('Course deleted!'); return id; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

export const assignFacultyToCourse = createAsyncThunk('courses/assignFaculty', async ({ id, facultyId }, { rejectWithValue }) => {
  try { const res = await api.patch(`/courses/${id}/assign-faculty`, { facultyId }); toast.success('Faculty assigned!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

const courseSlice = createSlice({
  name: 'courses',
  initialState: { courses: [], course: null, pagination: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (s) => { s.loading = true; })
      .addCase(fetchCourses.fulfilled, (s, a) => { s.loading = false; s.courses = a.payload.courses; s.pagination = a.payload.pagination; })
      .addCase(fetchCourses.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchCourseById.fulfilled, (s, a) => { s.course = a.payload; })
      .addCase(createCourse.fulfilled, (s, a) => { s.courses.unshift(a.payload); })
      .addCase(updateCourse.fulfilled, (s, a) => { s.courses = s.courses.map(c => c._id === a.payload._id ? a.payload : c); })
      .addCase(deleteCourse.fulfilled, (s, a) => { s.courses = s.courses.filter(c => c._id !== a.payload); })
      .addCase(assignFacultyToCourse.fulfilled, (s, a) => { s.courses = s.courses.map(c => c._id === a.payload._id ? a.payload : c); });
  },
});

export default courseSlice.reducer;