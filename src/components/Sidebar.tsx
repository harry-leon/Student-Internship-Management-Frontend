import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { canAccessPage } from '../auth/roleAccess';
import { NavPage, Role } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentRole: Role;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavPage;
  path: string;
  label: string;
  icon: string;
  requiredPermissions?: string[];
  featureFlag?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { can, hasFeature } = useAuth();

  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          id: 'dashboard' as NavPage,
          path: '/dashboard',
          label: 'Dashboard',
          icon: 'home',
          requiredPermissions: ['DASHBOARD_VIEW'],
        },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        {
          id: 'users' as NavPage,
          path: '/users',
          label: 'Users',
          icon: 'group',
          requiredPermissions: ['USER_VIEW'],
        },
        {
          id: 'students' as NavPage,
          path: '/students',
          label: 'Students',
          icon: 'school',
          requiredPermissions: ['STUDENT_VIEW'],
        },
        {
          id: 'mentors' as NavPage,
          path: '/mentors',
          label: 'Mentors',
          icon: 'supervisor_account',
          requiredPermissions: ['MENTOR_VIEW'],
        },
        {
          id: 'groups' as NavPage,
          path: '/groups',
          label: 'Groups',
          icon: 'groups',
          requiredPermissions: ['GROUP_VIEW'],
        },
      ],
    },
    {
      title: 'INTERNSHIP',
      items: [
        {
          id: 'companies' as NavPage,
          path: '/companies',
          label: 'Companies',
          icon: 'domain',
          requiredPermissions: ['COMPANY_VIEW'],
        },
        {
          id: 'tasks' as NavPage,
          path: '/tasks',
          label: currentRole === 'Student' ? 'My Tasks' : 'Group Tasks',
          icon: 'task',
          requiredPermissions: ['GROUP_TASK_VIEW', 'SUBMISSION_VIEW'],
        },
        {
          id: 'submissions' as NavPage,
          path: '/submissions',
          label: 'Submissions',
          icon: 'assignment_turned_in',
          requiredPermissions: ['SUBMISSION_VIEW'],
        },
        {
          id: 'weekly-reports' as NavPage,
          path: '/weekly-reports',
          label: 'Weekly Reports',
          icon: 'description',
          requiredPermissions: ['PHASE_VIEW'],
          featureFlag: 'WEEKLY_REPORT_SUBMISSION_ENABLED',
        },
        {
          id: 'applications' as NavPage,
          path: '/applications',
          label: 'Applications',
          icon: 'post_add',
          requiredPermissions: ['PHASE_VIEW'],
          featureFlag: 'APPLICATION_REGISTRATION_ENABLED',
        },
        {
          id: 'internship-phases' as NavPage,
          path: '/internship-phases',
          label: 'Internship Phases',
          icon: 'timeline',
          requiredPermissions: ['PHASE_VIEW'],
        },
        {
          id: 'assignments' as NavPage,
          path: '/assignments',
          label: 'Assignments',
          icon: 'assignment',
          requiredPermissions: ['ASSIGNMENT_VIEW'],
        },
      ],
    },
    {
      title: 'EVALUATION',
      items: [
        {
          id: 'evaluation-criteria' as NavPage,
          path: '/evaluation-criteria',
          label: 'Evaluation Criteria',
          icon: 'rule',
          requiredPermissions: ['ASSESSMENT_CREATE'],
        },
        {
          id: 'assessment-rounds' as NavPage,
          path: '/assessment-rounds',
          label: 'Assessment Rounds',
          icon: 'event_repeat',
          requiredPermissions: ['ASSESSMENT_CREATE'],
        },
        {
          id: 'assessment-results' as NavPage,
          path: '/assessment-results',
          label: 'Assessment Results',
          icon: 'insights',
          requiredPermissions: ['ASSESSMENT_VIEW'],
          featureFlag: currentRole === 'Student' ? 'STUDENT_VIEW_SCORE_ENABLED' : undefined,
        },
      ],
    },
    {
      title: 'SETTINGS',
      items: [
        {
          id: 'settings-roles' as NavPage,
          path: '/settings/roles',
          label: 'Roles',
          icon: 'shield_person',
          requiredPermissions: ['ROLE_VIEW', 'ROLE_PERMISSION_VIEW'],
        },
        {
          id: 'settings-permissions' as NavPage,
          path: '/settings/permissions',
          label: 'Permissions',
          icon: 'security',
          requiredPermissions: ['PERMISSION_VIEW', 'ROLE_PERMISSION_VIEW'],
        },
      ],
    },
  ];

  const hasAccessToItem = (item: NavItem): boolean => {
    // Feature flag check
    if (item.featureFlag && !hasFeature(item.featureFlag)) {
      return false;
    }
    // Permissions check: user must have at least one of requiredPermissions
    if (item.requiredPermissions && item.requiredPermissions.length > 0) {
      return item.requiredPermissions.some((perm) => can(perm));
    }
    return true;
  };

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter(hasAccessToItem),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[228px] flex-col border-r border-[#e2e8f0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-colors duration-200 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-[56px] items-center justify-between border-b border-[#f1f5f9] dark:border-slate-800 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004ac6] text-[11px] font-bold text-white shadow-xs">
              IMS
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold leading-none tracking-tight text-[#0b1c30] dark:text-white">
                IMS PORTAL
              </span>
              <span className="mt-0.5 text-[10px] leading-tight text-[#64748b] dark:text-slate-400">
                Internship Management
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-md p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <nav className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-2.5 py-2">
          {filteredSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <span className="mb-1 block px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8] dark:text-slate-500">
                {sec.title}
              </span>
              {sec.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/')) ||
                  (item.path === '/dashboard' && location.pathname === '/dashboard');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      onCloseMobile();
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-all cursor-pointer ${isActive
                      ? 'bg-[#2563eb] font-medium text-white shadow-[0_1px_4px_rgba(37,99,235,0.22)]'
                      : 'text-[#434655] dark:text-slate-300 hover:bg-[#e5eeff]/60 dark:hover:bg-slate-800 hover:text-[#0b1c30] dark:hover:text-white'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-[#dce9ff] dark:border-slate-800 bg-[#eff4ff] dark:bg-slate-800/60 p-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-[#004ac6]"></div>
              <div className="absolute h-4 w-4 rounded-full bg-[#004ac6]/25 animate-ping"></div>
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="truncate text-[12px] font-medium leading-tight text-[#0b1c30] dark:text-slate-200">
                Academic Term 2024-2
              </span>
              <span className="truncate text-[10px] leading-tight text-[#64748b] dark:text-slate-400">
                Active Operational Phase
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
