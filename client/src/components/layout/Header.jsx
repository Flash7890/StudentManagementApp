import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { MdMenu, MdNotifications, MdLogout } from 'react-icons/md';
import { logoutUser } from '../../features/auth/authSlice';

const Avatar = ({ user }) => (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold shadow-soft overflow-hidden">
    {user?.avatar
      ? <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
      : user?.name?.charAt(0).toUpperCase()
    }
  </div>
);

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-primary-100/60 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-10">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-primary-400 hover:text-primary-600 p-1.5 rounded-xl hover:bg-surface-muted transition-colors"
      >
        <MdMenu size={22} />
      </button>

      <div className="flex-1 lg:flex-none">
        <h2 className="text-xs font-medium text-primary-400 hidden lg:block tracking-widest uppercase">
          University Student Management System
        </h2>
      </div>

      <div className="flex items-center gap-1.5">
        <Link
          to="/notifications"
          className="relative p-2 text-primary-400 hover:text-primary-600 hover:bg-surface-muted rounded-2xl transition-all"
        >
          <MdNotifications size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/profile"
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-muted rounded-2xl transition-all"
        >
          <Avatar user={user} />
          <span className="text-sm font-medium text-primary-700 hidden md:block">{user?.name}</span>
        </Link>

        <button
          onClick={handleLogout}
          className="p-2 text-primary-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
          title="Logout"
        >
          <MdLogout size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;