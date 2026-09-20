const PendingApprovalBanner = ({ title = 'Profile Pending Approval', compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 text-sm">
        <div className="w-6 h-6 rounded-full border border-amber-300 flex items-center justify-center shrink-0">
          <span className="text-amber-500 text-xs font-semibold">!</span>
        </div>
        <div>
          <p className="font-medium text-amber-700 text-xs">Your profile is awaiting admin approval</p>
          <p className="text-amber-500 text-xs font-light">Contact your university admin to get activated.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-5 border border-amber-100">
        <span className="text-amber-400 text-2xl font-light">!</span>
      </div>
      <h2 className="font-display text-2xl text-primary-900 mb-2">{title}</h2>
      <p className="text-primary-400 max-w-sm mb-6 text-sm font-light leading-relaxed">
        Your account has been created, but your profile has not been approved by an administrator yet.
        Data will appear here once your account is activated.
      </p>
      <div className="bg-surface-subtle border border-primary-100 rounded-2xl p-5 text-left max-w-sm w-full">
        <p className="text-primary-600 text-xs font-semibold mb-2 uppercase tracking-widest">What to do next</p>
        <ul className="text-primary-500 text-sm space-y-1.5 font-light">
          <li>Contact your university admin or department office</li>
          <li>Provide your registered email to get your profile linked</li>
          <li>Come back once your profile has been activated</li>
        </ul>
      </div>
    </div>
  );
};

export default PendingApprovalBanner;