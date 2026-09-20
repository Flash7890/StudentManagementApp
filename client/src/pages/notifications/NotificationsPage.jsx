import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications, markNotificationRead,
  markAllNotificationsRead, deleteNotification, sendAnnouncement,
} from '../../features/notifications/notificationSlice';
import { PageHeader, LoadingScreen, Badge, Modal, Pagination } from '../../components/common';
import { useForm } from 'react-hook-form';
import { MdDelete, MdMarkEmailRead, MdCampaign } from 'react-icons/md';

const typeColor = (type) => ({
  enrollment: 'blue', grade: 'green', announcement: 'purple',
  attendance: 'yellow', general: 'gray',
}[type] || 'gray');

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, pagination, loading } = useSelector((s) => s.notifications);
  const { user } = useSelector((s) => s.auth);

  const [page, setPage] = useState(1);
  const [announceModal, setAnnounceModal] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    dispatch(fetchNotifications({ page }));
  }, [page]);

  const handleMarkRead = (id) => dispatch(markNotificationRead(id));
  const handleMarkAll = () => dispatch(markAllNotificationsRead());
  const handleDelete = (id) => dispatch(deleteNotification(id));

  const onAnnounce = async (data) => {
    await dispatch(sendAnnouncement({ ...data, roles: data.roles ? [data.roles] : undefined }));
    setAnnounceModal(false);
    reset();
  };

  if (loading) return <LoadingScreen />;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
        action={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="btn-secondary flex items-center gap-1 text-sm">
                <MdMarkEmailRead size={16} /> Mark all read
              </button>
            )}
            {user?.role === 'admin' && (
              <button onClick={() => setAnnounceModal(true)} className="btn-primary flex items-center gap-1 text-sm">
                <MdCampaign size={16} /> Announce
              </button>
            )}
          </div>
        }
      />

      {notifications.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">
          <p className="text-4xl mb-2">🔔</p>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card py-4 flex items-start gap-4 transition-all
                ${!n.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge color={typeColor(n.type)}>{n.type}</Badge>
                  {!n.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full inline-block" />}
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(n.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
                    title="Mark as read"
                  >
                    <MdMarkEmailRead size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n._id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                  title="Delete"
                >
                  <MdDelete size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Announcement Modal */}
      <Modal open={announceModal} onClose={() => setAnnounceModal(false)} title="Send Announcement">
        <form onSubmit={handleSubmit(onAnnounce)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input {...register('title', { required: true })} className="input-field" placeholder="Announcement title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea {...register('message', { required: true })} rows={4} className="input-field" placeholder="Write your announcement..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Send to</label>
            <select {...register('roles')} className="input-field">
              <option value="">All users</option>
              <option value="student">Students only</option>
              <option value="faculty">Faculty only</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAnnounceModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Sending...' : 'Send Announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NotificationsPage;