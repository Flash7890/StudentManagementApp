import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchPendingCount } from '../../features/registrations/registrationSlice';
import {
  MdDashboard, MdPeople, MdSchool, MdBook, MdCalendarToday,
  MdAssignment, MdGrade, MdNotifications, MdPerson, MdClose, MdHowToReg,
  MdAutoAwesome,
} from 'react-icons/md';

const navItems = {
  admin: [
    { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
    { to: '/students', icon: MdPeople, label: 'Students' },
    { to: '/faculty', icon: MdSchool, label: 'Faculty' },
    { to: '/registrations', icon: MdHowToReg, label: 'Registrations', badge: true },
    { to: '/courses', icon: MdBook, label: 'Courses' },
    { to: '/attendance', icon: MdCalendarToday, label: 'Attendance' },
    { to: '/grades', icon: MdGrade, label: 'Grades', end: true },
    { to: '/timetable', icon: MdAssignment, label: 'Timetable' },
    { to: '/notifications', icon: MdNotifications, label: 'Notifications' },
    { to: '/assistant', icon: MdAutoAwesome, label: 'Assistant' },
    { to: '/profile', icon: MdPerson, label: 'Profile' },
  ],
  faculty: [
    { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
    { to: '/students', icon: MdPeople, label: 'Students' },
    { to: '/courses', icon: MdBook, label: 'My Courses' },
    { to: '/attendance/mark', icon: MdCalendarToday, label: 'Attendance' },
    { to: '/grades', icon: MdGrade, label: 'Grades', end: true },
    { to: '/timetable', icon: MdAssignment, label: 'Timetable' },
    { to: '/notifications', icon: MdNotifications, label: 'Notifications' },
    { to: '/assistant', icon: MdAutoAwesome, label: 'Assistant' },
    { to: '/profile', icon: MdPerson, label: 'Profile' },
  ],
  student: [
    { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
    { to: '/courses', icon: MdBook, label: 'Courses' },
    { to: '/attendance', icon: MdCalendarToday, label: 'Attendance' },
    { to: '/grades', icon: MdGrade, label: 'Grades', end: true },
    { to: '/grades/transcript', icon: MdAssignment, label: 'Transcript' },
    { to: '/timetable', icon: MdAssignment, label: 'Timetable' },
    { to: '/notifications', icon: MdNotifications, label: 'Notifications' },
    { to: '/assistant', icon: MdAutoAwesome, label: 'Assistant' },
    { to: '/profile', icon: MdPerson, label: 'Profile' },
  ],
};

const Avatar = ({ user, size = 'md' }) => {
  const dim = size === 'lg' ? 'w-9 h-9' : 'w-8 h-8';
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-soft overflow-hidden`}>
      {user?.avatar
        ? <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
        : user?.name?.charAt(0).toUpperCase()
      }
    </div>
  );
};

const Sidebar = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { pendingCount } = useSelector((s) => s.registrations);
  const items = navItems[user?.role] || navItems.student;

  useEffect(() => {
    if (user?.role === 'admin') dispatch(fetchPendingCount());
  }, [user?.role]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col
          transform transition-transform duration-300 ease-in-out
          bg-white border-r border-primary-100/80 shadow-card
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-primary-100/60">
          <div>
            <h1 className="font-display text-2xl text-primary-700 leading-none tracking-tight">USMS</h1>
            <p className="text-xs text-primary-400 mt-0.5 font-light tracking-wide">Student Management</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-primary-300 hover:text-primary-600 transition-colors p-1 rounded-xl"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-primary-100/60">
          <div className="flex items-center gap-3 bg-surface-subtle rounded-2xl px-3 py-2.5">
            <Avatar user={user} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-primary-900 truncate leading-tight">{user?.name}</p>
              <p className="text-xs text-primary-400 capitalize font-light">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {items.map(({ to, icon: Icon, label, badge, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-primary-500 text-white shadow-soft'
                  : 'text-primary-500 hover:bg-surface-muted hover:text-primary-700'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span className="flex-1 tracking-wide">{label}</span>
              {badge && pendingCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom accent */}
        <div className="px-5 py-4 border-t border-primary-100/60">
          <p className="text-xs text-primary-300 text-center font-light tracking-widest uppercase">
            University System
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;