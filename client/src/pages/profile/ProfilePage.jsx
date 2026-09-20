import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { updateMyProfile } from '../../features/users/userSlice';
import { getMe } from '../../features/auth/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { PageHeader, PendingApprovalBanner } from '../../components/common';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, profileLinked } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [avatarFile, setAvatarFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: pErrors } } = useForm({
    defaultValues: { name: user?.name },
  });

  const { register: regPwd, handleSubmit: handlePwd, watch, reset: resetPwd, formState: { errors: pwErrors, isSubmitting: pwSubmitting } } = useForm();

  const onSaveProfile = async (data) => {
    setSavingProfile(true);
    const formData = new FormData();
    formData.append('name', data.name);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      await api.patch('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Profile updated!');
      dispatch(getMe());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    try {
      await api.patch('/users/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed!');
      resetPwd();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const avatarPreview = avatarFile
    ? URL.createObjectURL(avatarFile)
    : user?.avatar
    ? user.avatar
    : null;

  return (
    <div>
      <PageHeader title="My Profile" />

      {/* Show pending approval notice for unapproved students/faculty */}
      {['student', 'faculty'].includes(user?.role) && profileLinked === false && (
        <div className="mb-6 max-w-2xl">
          <PendingApprovalBanner compact />
        </div>
      )}

      <div className="max-w-2xl">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {['profile', 'security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors
                ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <form onSubmit={handleProfile(onSaveProfile)} className="card space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 text-3xl font-bold flex items-center justify-center overflow-hidden">
                  {avatarPreview
                    ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    : user?.name?.charAt(0).toUpperCase()
                  }
                </div>
              </div>
              <div>
                <label className="btn-secondary cursor-pointer text-sm">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Max 5MB</p>
              </div>
            </div>

            {/* Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input {...regProfile('name', { required: 'Name is required' })} className="input-field" />
              {pErrors.name && <p className="text-red-500 text-xs mt-1">{pErrors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={user?.email} disabled className="input-field opacity-60 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input value={user?.role} disabled className="input-field opacity-60 cursor-not-allowed capitalize" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={savingProfile} className="btn-primary">
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={handlePwd(onChangePassword)} className="card space-y-5">
            <h3 className="font-semibold text-gray-800">Change Password</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                {...regPwd('currentPassword', { required: 'Required' })}
                type="password"
                className="input-field"
                placeholder="••••••••"
              />
              {pwErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.currentPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                {...regPwd('newPassword', {
                  required: 'Required',
                  minLength: { value: 8, message: 'Min 8 characters' },
                  pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Need uppercase, lowercase & number' },
                })}
                type="password"
                className="input-field"
                placeholder="Min 8 characters"
              />
              {pwErrors.newPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                {...regPwd('confirmPassword', {
                  required: 'Required',
                  validate: (v) => v === watch('newPassword') || 'Passwords do not match',
                })}
                type="password"
                className="input-field"
                placeholder="Repeat new password"
              />
              {pwErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{pwErrors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={pwSubmitting} className="btn-primary">
              {pwSubmitting ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;