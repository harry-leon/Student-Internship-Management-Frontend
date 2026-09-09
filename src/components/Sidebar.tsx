import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { navigationSections, NavItemConfig } from '../config/navigation.config';
import { layoutConfig } from '../config/layout.config';
import { uiConfig } from '../config/ui.config';

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
  const { can, hasFeature } = useAuth();

  const hasAccessToItem = (item: NavItemConfig): boolean => {
    // Role restriction check if configured
    if (item.allowedRoles && !item.allowedRoles.includes(currentRole)) {
      return false;
    }
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

  const filteredSections = navigationSections
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
        className={`fixed left-0 top-0 z-50 flex h-screen ${layoutConfig.sidebar.widthClass} flex-col border-r border-[#e2e8f0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-colors duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className={`flex ${layoutConfig.header.heightClass} items-center justify-between border-b border-[#f1f5f9] dark:border-slate-800 px-4`}>
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center ${uiConfig.radius.card} bg-[#004ac6] text-[11px] font-bold text-white shadow-xs`}>
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
            className={`p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden ${uiConfig.radius.button}`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Navigation Sections */}
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
                
                const label = typeof item.label === 'function' ? item.label(currentRole) : item.label;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      onCloseMobile();
                    }}
                    className={`flex w-full items-center gap-2.5 ${uiConfig.radius.card} px-2.5 py-2 text-left text-[13px] transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#2563eb] font-medium text-white shadow-[0_1px_4px_rgba(37,99,235,0.22)]'
                        : 'text-[#434655] dark:text-slate-300 hover:bg-[#e5eeff]/60 dark:hover:bg-slate-800 hover:text-[#0b1c30] dark:hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {item.icon}
                    </span>
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Term Status Indicator Footer */}
        <div className="border-t border-[#dce9ff] dark:border-slate-800 bg-[#eff4ff] dark:bg-slate-800/60 p-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-[#004ac6]"></div>
              <div className="absolute h-4 w-4 rounded-full bg-[#004ac6]/25 animate-ping"></div>
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="truncate text-[12px] font-medium leading-tight text-[#0b1c30] dark:text-slate-200">
                Hệ Thống Trực Tuyến
              </span>
              <span className="truncate text-[10px] leading-tight text-[#64748b] dark:text-slate-400">
                System Connected
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
