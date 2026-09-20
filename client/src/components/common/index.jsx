// Spinner
export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin`} />
  );
};

// LoadingScreen
export const LoadingScreen = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
);

// Badge
export const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    gray:   'bg-primary-50 text-primary-500',
    green:  'bg-emerald-50 text-emerald-600',
    red:    'bg-rose-50 text-rose-600',
    blue:   'bg-sky-50 text-sky-600',
    yellow: 'bg-amber-50 text-amber-600',
    purple: 'bg-violet-50 text-violet-600',
  };
  return (
    <span className={`badge ${colors[color]}`}>{children}</span>
  );
};

// StatCard
export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colors = {
    blue:   'bg-primary-50 text-primary-500',
    green:  'bg-emerald-50 text-emerald-500',
    purple: 'bg-violet-50 text-violet-500',
    orange: 'bg-amber-50 text-amber-500',
    red:    'bg-rose-50 text-rose-500',
  };
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-primary-400 uppercase tracking-widest">{title}</p>
          <p className="text-3xl font-display text-primary-800 mt-1.5 leading-none">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-primary-300 mt-1.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${colors[color]} shrink-0`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
};

// PageHeader
export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
    <div>
      <h1 className="font-display text-3xl text-primary-900 leading-tight">{title}</h1>
      {subtitle && <p className="text-sm text-primary-400 mt-1 font-light tracking-wide">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

// Modal
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-primary-950/30 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-card w-full ${sizes[size]} max-h-[90vh] overflow-y-auto border border-primary-100/60`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-100/60">
          <h3 className="font-display text-xl text-primary-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-primary-300 hover:text-primary-600 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-xl hover:bg-surface-muted transition-all"
          >
            &times;
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ConfirmDialog
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmText = 'Delete', loading }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p className="text-primary-500 mb-6 text-sm leading-relaxed">{message}</p>
    <div className="flex justify-end gap-3">
      <button onClick={onClose} className="btn-secondary">Cancel</button>
      <button onClick={onConfirm} disabled={loading} className="btn-danger">
        {loading ? 'Processing...' : confirmText}
      </button>
    </div>
  </Modal>
);

// Pagination
export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  return (
    <div className="flex items-center justify-between mt-5 text-sm">
      <p className="text-primary-400 font-light">Page {page} of {pages}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary py-1.5 px-4 disabled:opacity-30"
        >
          Prev
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="btn-secondary py-1.5 px-4 disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// SearchBar
export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="input-field max-w-xs"
  />
);

// EmptyState
export const EmptyState = ({ title, description, action }) => (
  <div className="text-center py-16">
    <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center mx-auto mb-4">
      <span className="text-primary-300 text-xl font-light">—</span>
    </div>
    <h3 className="font-display text-lg text-primary-600">{title}</h3>
    {description && <p className="text-primary-400 text-sm mt-1.5 font-light">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// StatusBadge helper
export const statusColor = (status) => {
  const map = {
    active: 'green', inactive: 'gray', completed: 'blue',
    dropped: 'red', graduated: 'purple', suspended: 'red',
    present: 'green', absent: 'red', late: 'yellow',
    on_leave: 'yellow',
  };
  return map[status] || 'gray';
};

export { default as PendingApprovalBanner } from './PendingApprovalBanner';