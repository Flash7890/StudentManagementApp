import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchStudents = createAsyncThunk('students/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/students', { params });
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchStudentById = createAsyncThunk('students/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/students/${id}`);
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMyStudentProfile = createAsyncThunk('students/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/students/me');
    return res.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createStudent = createAsyncThunk('students/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/students', data);
    toast.success('Student created!');
    return res.data.data;
  } catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

export const updateStudent = createAsyncThunk('students/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/students/${id}`, data);
    toast.success('Student updated!');
    return res.data.data;
  } catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

export const deleteStudent = createAsyncThunk('students/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/students/${id}`);
    toast.success('Student deleted!');
    return id;
  } catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

const studentSlice = createSlice({
  name: 'students',
  initialState: {
    students: [],
    student: null,
    myProfile: null,
    myProfileNotFound: false,
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (s) => { s.loading = true; })
      .addCase(fetchStudents.fulfilled, (s, a) => { s.loading = false; s.students = a.payload.students; s.pagination = a.payload.pagination; })
      .addCase(fetchStudents.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchStudentById.fulfilled, (s, a) => { s.student = a.payload; })
      .addCase(fetchMyStudentProfile.fulfilled, (s, a) => { s.myProfile = a.payload; s.myProfileNotFound = false; })
      .addCase(fetchMyStudentProfile.rejected, (s) => { s.myProfileNotFound = true; })
      .addCase(createStudent.fulfilled, (s, a) => { s.students.unshift(a.payload.student); })
      .addCase(updateStudent.fulfilled, (s, a) => { s.students = s.students.map(st => st._id === a.payload._id ? a.payload : st); })
      .addCase(deleteStudent.fulfilled, (s, a) => { s.students = s.students.filter(st => st._id !== a.payload); });
  },
});

export default studentSlice.reducer;