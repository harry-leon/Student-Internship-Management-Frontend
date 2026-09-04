import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROLE_PAGES } from '../auth/roleAccess';
import { NavPage, Role } from '../types';

interface SidebarProps {
  currentRole: Role;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard' as NavPage, label: 'Dashboard', icon: 'home' },
      ],
    },
    {
      title: 'PEOPLE',
      items: [
        { id: 'users' as NavPage, label: 'Users', icon: 'group' },
        { id: 'students' as NavPage, label: 'Students', icon: 'school' },
        { id: 'mentors' as NavPage, label: 'Mentors', icon: 'supervisor_account' },
      ],
    },
    {
      title: 'INTERNSHIP',
      items: [
        { id: 'companies' as NavPage, label: 'Companies', icon: 'domain' },
        { id: 'applications' as NavPage, label: 'Applications', icon: 'post_add' },
        { id: 'internship-phases' as NavPage, label: 'Internship Phases', icon: 'timeline' },
        { id: 'assignments' as NavPage, label: 'Assignments', icon: 'assignment' },
      ],
    },
    {
      title: 'EVALUATION',
      items: [
        { id: 'evaluation-criteria' as NavPage, label: 'Evaluation Criteria', icon: 'rule' },
        { id: 'assessment-rounds' as NavPage, label: 'Assessment Rounds', icon: 'event_repeat' },
        { id: 'assessment-results' as NavPage, label: 'Assessment Results', icon: 'insights' },
      ],
    },
  ];

  const allowedPages = ROLE_PAGES[currentRole] || ROLE_PAGES.Admin;
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => allowedPages.includes(item.id)),
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
        className={`fixed left-0 top-0 z-50 flex h-screen w-[228px] flex-col border-r border-[#e2e8f0] bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-200 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-[56px] items-center justify-between border-b border-[#f1f5f9] px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#004ac6] text-[11px] font-bold text-white shadow-xs">
              IMS
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold leading-none tracking-tight text-[#0b1c30]">
                IMS PORTAL
              </span>
              <span className="mt-0.5 text-[10px] leading-tight text-[#64748b]">
                Internship Management
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded-md p-1 text-slate-400 hover:text-slate-700 lg:hidden"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <nav className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-2.5 py-2">
          {filteredSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <span className="mb-1 block px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
                {sec.title}
              </span>
              {sec.items.map((item) => {
                const routePath = `/admin/${item.id}`;
                const isActive = location.pathname.startsWith(routePath);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      navigate(routePath);
                      onCloseMobile();
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-all ${isActive
                      ? 'bg-[#2563eb] font-medium text-white shadow-[0_1px_4px_rgba(37,99,235,0.22)]'
                      : 'text-[#434655] hover:bg-[#e5eeff]/60 hover:text-[#0b1c30]'
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

        <div className="border-t border-[#dce9ff] bg-[#eff4ff] p-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-[#004ac6]"></div>
              <div className="absolute h-4 w-4 rounded-full bg-[#004ac6]/25 animate-ping"></div>
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="truncate text-[12px] font-medium leading-tight text-[#0b1c30]">
                Academic Term 2024-2
              </span>
              <span className="truncate text-[10px] leading-tight text-[#64748b]">
                Active Operational Phase
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
