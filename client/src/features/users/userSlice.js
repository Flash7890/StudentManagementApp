import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchUsers = createAsyncThunk('users/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/users', { params }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateUser = createAsyncThunk('users/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await api.patch(`/users/${id}`, data); toast.success('User updated!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

export const deleteUser = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/users/${id}`); toast.success('User deleted!'); return id; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

export const updateMyProfile = createAsyncThunk('users/updateProfile', async (data, { rejectWithValue }) => {
  try { const res = await api.patch('/users/profile', data); toast.success('Profile updated!'); return res.data.data; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

const userSlice = createSlice({
  name: 'users',
  initialState: { users: [], pagination: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (s) => { s.loading = true; })
      .addCase(fetchUsers.fulfilled, (s, a) => { s.loading = false; s.users = a.payload.users; s.pagination = a.payload.pagination; })
      .addCase(fetchUsers.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateUser.fulfilled, (s, a) => { s.users = s.users.map(u => u._id === a.payload._id ? a.payload : u); })
      .addCase(deleteUser.fulfilled, (s, a) => { s.users = s.users.filter(u => u._id !== a.payload); });
  },
});

export default userSlice.reducer;