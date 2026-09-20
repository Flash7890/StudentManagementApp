import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (_, { rejectWithValue }) => {
  try { const res = await api.get('/dashboard'); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (s) => { s.loading = true; })
      .addCase(fetchDashboard.fulfilled, (s, a) => { s.loading = false; s.data = a.payload; })
      .addCase(fetchDashboard.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export default dashboardSlice.reducer;