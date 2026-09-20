import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await api.get('/notifications', { params }); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try { const res = await api.patch(`/notifications/${id}/read`); return res.data.data; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try { await api.patch('/notifications/mark-all-read'); return true; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteNotification = createAsyncThunk('notifications/delete', async (id, { rejectWithValue }) => {
  try { await api.delete(`/notifications/${id}`); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const sendAnnouncement = createAsyncThunk('notifications/announce', async (data, { rejectWithValue }) => {
  try { await api.post('/notifications/announcement', data); toast.success('Announcement sent!'); return true; }
  catch (err) { toast.error(err.response?.data?.message); return rejectWithValue(err.response?.data?.message); }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { notifications: [], unreadCount: 0, pagination: null, loading: false },
  reducers: {
    addNotification(state, action) {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (s) => { s.loading = true; })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.loading = false;
        s.notifications = a.payload.notifications;
        s.unreadCount = a.payload.unreadCount;
        s.pagination = a.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (s) => { s.loading = false; })
      .addCase(markNotificationRead.fulfilled, (s, a) => {
        const idx = s.notifications.findIndex(n => n._id === a.payload._id);
        if (idx >= 0) { s.notifications[idx].isRead = true; s.unreadCount = Math.max(0, s.unreadCount - 1); }
      })
      .addCase(markAllNotificationsRead.fulfilled, (s) => {
        s.notifications = s.notifications.map(n => ({ ...n, isRead: true }));
        s.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (s, a) => {
        const n = s.notifications.find(n => n._id === a.payload);
        if (n && !n.isRead) s.unreadCount = Math.max(0, s.unreadCount - 1);
        s.notifications = s.notifications.filter(n => n._id !== a.payload);
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;