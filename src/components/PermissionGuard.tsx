import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role, NavPage } from '../types';
import { canAccessPage } from '../auth/roleAccess';

interface PermissionGuardProps {
  page: NavPage;
  requiredPermission?: string;
  requiredRoles?: Role[];
  featureFlag?: string;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  page,
  requiredPermission,
  requiredRoles,
  featureFlag,
  children,
}) => {
  const { user, can, hasFeature, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const activeRole = (user?.role as Role) || 'Student';

  // Check required roles if specified
  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(activeRole)) {
    return <ForbiddenState page={page} role={activeRole} onGoHome={() => navigate('/dashboard')} />;
  }

  // Check feature flag if specified
  if (featureFlag && hasFeature && !hasFeature(featureFlag)) {
    return <ForbiddenState page={page} role={activeRole} onGoHome={() => navigate('/dashboard')} />;
  }

  // Check explicit permission if specified
  if (requiredPermission && can && !can(requiredPermission)) {
    return <ForbiddenState page={page} role={activeRole} onGoHome={() => navigate('/dashboard')} />;
  }

  // Check page level access via roleAccess matrix
  const isAllowed = canAccessPage(activeRole, page, can, hasFeature);
  if (!isAllowed) {
    return <ForbiddenState page={page} role={activeRole} onGoHome={() => navigate('/dashboard')} />;
  }

  return <>{children}</>;
};

interface ForbiddenStateProps {
  page: string;
  role: string;
  onGoHome: () => void;
}

const ForbiddenState: React.FC<ForbiddenStateProps> = ({ page, role, onGoHome }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/40 p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-xs animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-[32px]">block</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Không Có Quyền Truy Cập (403)</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
        Tài nguyên <strong className="text-slate-900 dark:text-white font-bold">[{page}]</strong> không thuộc phạm vi phân quyền của tài khoản vai trò <strong className="text-indigo-600 dark:text-indigo-400 font-bold">[{role}]</strong>.
      </p>
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center">
        <button
          type="button"
          onClick={onGoHome}
          className="px-6 py-3 bg-[#004ac6] hover:bg-[#003ea8] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          <span>Quay về trang Dashboard</span>
        </button>
      </div>
    </div>
  );
};
