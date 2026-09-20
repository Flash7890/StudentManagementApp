import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchFaculty = createAsyncThunk('faculty/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/faculty', { params }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchFacultyById = createAsyncThunk('faculty/fetchById', async (id, { rejectWithValue }) => {
  try { const res = await api.get(`/faculty/${id}`); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMyFacultyProfile = createAsyncThunk('faculty/fetchMe', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/faculty/me'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createFaculty = createAsyncThunk('faculty/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/faculty', data); toast.success('Faculty created!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

export const updateFaculty = createAsyncThunk('faculty/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.patch(`/faculty/${id}`, data); toast.success('Faculty updated!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

export const deleteFaculty = createAsyncThunk('faculty/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/faculty/${id}`); toast.success('Faculty deleted!'); return id; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

const facultySlice = createSlice({
  name: 'faculty',
  initialState: { faculty: [], member: null, myProfile: null, pagination: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaculty.pending, (s) => { s.loading = true; })
      .addCase(fetchFaculty.fulfilled, (s, a) => { s.loading = false; s.faculty = a.payload.faculty; s.pagination = a.payload.pagination; })
      .addCase(fetchFaculty.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchFacultyById.fulfilled, (s, a) => { s.member = a.payload; })
      .addCase(fetchMyFacultyProfile.fulfilled, (s, a) => { s.myProfile = a.payload; })
      .addCase(createFaculty.fulfilled, (s, a) => { s.faculty.unshift(a.payload.faculty); })
      .addCase(updateFaculty.fulfilled, (s, a) => { s.faculty = s.faculty.map(f => f._id === a.payload._id ? a.payload : f); })
      .addCase(deleteFaculty.fulfilled, (s, a) => { s.faculty = s.faculty.filter(f => f._id !== a.payload); });
  },
});

export default facultySlice.reducer;