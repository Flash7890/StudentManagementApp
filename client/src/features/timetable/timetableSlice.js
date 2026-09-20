import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchMyTimetable = createAsyncThunk('timetable/fetchMine', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/timetable/me'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchTimetable = createAsyncThunk('timetable/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/timetable', { params }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createTimetableEntry = createAsyncThunk('timetable/create', async (data, { rejectWithValue }) => {
  try { const res = await api.post('/timetable', data); toast.success('Entry created!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

export const deleteTimetableEntry = createAsyncThunk('timetable/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/timetable/${id}`); toast.success('Entry deleted!'); return id; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

const timetableSlice = createSlice({
  name: 'timetable',
  initialState: { entries: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTimetable.pending, (s) => { s.loading = true; })
      .addCase(fetchMyTimetable.fulfilled, (s, a) => { s.loading = false; s.entries = a.payload; })
      .addCase(fetchMyTimetable.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchTimetable.fulfilled, (s, a) => { s.entries = a.payload; })
      .addCase(createTimetableEntry.fulfilled, (s, a) => { s.entries.push(a.payload); })
      .addCase(deleteTimetableEntry.fulfilled, (s, a) => { s.entries = s.entries.filter(e => e._id !== a.payload); });
  },
});

export default timetableSlice.reducer;