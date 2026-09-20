import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchPendingRegistrations = createAsyncThunk(
  'registrations/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/registrations', { params });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Fetch failed');
    }
  }
);

export const fetchPendingCount = createAsyncThunk(
  'registrations/count',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/registrations/count');
      return res.data.data.count;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const approveRegistration = createAsyncThunk(
  'registrations/approve',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/registrations/${id}/approve`, data);
      toast.success('Registration approved!');
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const rejectRegistration = createAsyncThunk(
  'registrations/reject',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/registrations/${id}/reject`, { reason });
      toast.success('Registration rejected.');
      return res.data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const registrationSlice = createSlice({
  name: 'registrations',
  initialState: {
    registrations: [],
    pagination: null,
    pendingCount: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingRegistrations.pending, (s) => { s.loading = true; })
      .addCase(fetchPendingRegistrations.fulfilled, (s, a) => {
        s.loading = false;
        s.registrations = a.payload.registrations;
        s.pagination = a.payload.pagination;
      })
      .addCase(fetchPendingRegistrations.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchPendingCount.fulfilled, (s, a) => { s.pendingCount = a.payload; })
      .addCase(approveRegistration.fulfilled, (s, a) => {
        s.registrations = s.registrations.filter(r => r._id !== a.payload.pending._id);
        s.pendingCount = Math.max(0, s.pendingCount - 1);
      })
      .addCase(rejectRegistration.fulfilled, (s, a) => {
        s.registrations = s.registrations.filter(r => r._id !== a.payload._id);
        s.pendingCount = Math.max(0, s.pendingCount - 1);
      });
  },
});

export default registrationSlice.reducer;