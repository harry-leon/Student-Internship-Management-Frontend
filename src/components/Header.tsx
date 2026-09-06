import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavPage, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';

import { useTheme, ThemeMode } from '../context/ThemeContext';

interface HeaderProps {
  currentRole: Role;
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
  onOpenLoginModal?: () => void;
}

const PAGE_TITLES: Record<NavPage, { parent: string; current: string }> = {
  dashboard: { parent: 'Dashboard', current: 'Overview' },
  companies: { parent: 'Internship', current: 'Companies' },
  applications: { parent: 'Internship', current: 'Applications' },
  'weekly-reports': { parent: 'Internship', current: 'Weekly Reports' },
  submissions: { parent: 'Internship', current: 'Submissions' },
  tasks: { parent: 'Internship', current: 'Tasks' },
  users: { parent: 'People', current: 'Users' },
  students: { parent: 'People', current: 'Students' },
  mentors: { parent: 'People', current: 'Mentors' },
  groups: { parent: 'People', current: 'Groups' },
  'mentor-groups': { parent: 'People', current: 'Mentor Groups' },
  'internship-phases': { parent: 'Internship', current: 'Internship Phases' },
  assignments: { parent: 'Internship', current: 'Assignments' },
  'evaluation-criteria': { parent: 'Evaluation', current: 'Evaluation Criteria' },
  'assessment-rounds': { parent: 'Evaluation', current: 'Assessment Rounds' },
  'assessment-results': { parent: 'Evaluation', current: 'Assessment Results' },
  'settings-roles': { parent: 'Settings', current: 'Roles' },
  'settings-permissions': { parent: 'Settings', current: 'Permissions' },
  'role-permissions': { parent: 'Settings', current: 'Role & Permissions' },
  'admin-group-rooms': { parent: 'System', current: 'Quản Lý Phòng Nhóm' },
  'group-rooms': { parent: 'Groups', current: 'Phòng Làm Việc Nhóm' },
  'group-room': { parent: 'Groups', current: 'Phòng Làm Việc Nhóm' },
  profile: { parent: 'Account', current: 'My Profile' },
  'my-profile': { parent: 'Account', current: 'My Profile' },
  login: { parent: 'Account', current: 'Xác thực hệ thống' },
  landing: { parent: 'Overview', current: 'Trang chủ' },
};

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onOpenSearch,
  onOpenMobileMenu,
  onOpenLoginModal,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumb = (): { parent: string; current: string } => {
    const path = location.pathname;
    if (path.startsWith('/settings/roles')) return { parent: 'Settings', current: 'Roles' };
    if (path.startsWith('/settings/permissions')) return { parent: 'Settings', current: 'Permissions' };
    if (path.startsWith('/groups/') && path.endsWith('/tasks')) return { parent: 'Groups', current: 'Group Tasks' };
    if (path.startsWith('/groups/')) return { parent: 'Groups', current: 'Group Room' };
    if (path === '/groups') return { parent: 'People', current: 'Groups' };
    if (path === '/tasks') return { parent: 'Internship', current: 'Tasks' };
    if (path === '/submissions') return { parent: 'Internship', current: 'Submissions' };
    if (path === '/profile' || path === '/my-profile') return { parent: 'Account', current: 'My Profile' };
    if (path === '/users') return { parent: 'People', current: 'Users' };
    if (path === '/students') return { parent: 'People', current: 'Students' };
    if (path === '/mentors') return { parent: 'People', current: 'Mentors' };
    if (path === '/companies') return { parent: 'Internship', current: 'Companies' };
    if (path === '/weekly-reports') return { parent: 'Internship', current: 'Weekly Reports' };
    if (path === '/applications') return { parent: 'Internship', current: 'Applications' };
    if (path === '/assignments') return { parent: 'Internship', current: 'Assignments' };
    if (path === '/internship-phases') return { parent: 'Internship', current: 'Phases' };
    if (path === '/evaluation-criteria') return { parent: 'Evaluation', current: 'Criteria' };
    if (path === '/assessment-rounds') return { parent: 'Evaluation', current: 'Assessment Rounds' };
    if (path === '/assessment-results') return { parent: 'Evaluation', current: 'Assessment Results' };
    return { parent: 'Dashboard', current: 'Overview' };
  };

  const breadcrumb = getBreadcrumb();
  const { isAuthenticated, user, logout } = useAuth();
  const { themeMode, isDark, setThemeMode } = useTheme();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const themeIcon = themeMode === 'system' ? 'desktop_windows' : isDark ? 'dark_mode' : 'light_mode';
  const themeLabel = themeMode === 'system' ? 'Hệ thống' : isDark ? 'Giao diện Tối' : 'Giao diện Sáng';

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-[56px] items-center justify-between border-b border-[#e2e8f0] dark:border-slate-800 bg-white/92 dark:bg-slate-900/92 px-3 shadow-[0_1px_8px_rgba(0,0,0,0.03)] backdrop-blur-xl sm:px-4 lg:left-[228px] lg:px-6 transition-colors">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg p-1.5 text-[#64748b] dark:text-slate-400 transition-colors hover:bg-[#f1f5f9] dark:hover:bg-slate-800 hover:text-[#0b1c30] dark:hover:text-white lg:hidden"
          aria-label="Open sidebar menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12.5px] sm:text-[13px]">
          <span className="font-medium text-[#0b1c30] dark:text-slate-200">{breadcrumb.parent}</span>
          <span className="material-symbols-outlined text-[14px] text-[#94a3b8] dark:text-slate-500">
            chevron_right
          </span>
          <span className="text-[#64748b] dark:text-slate-400">{breadcrumb.current}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenLoginModal}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
            isAuthenticated
              ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              : 'border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
          }`}
          title="Trạng thái tài khoản người dùng"
        >
          <span className={`h-2 w-2 rounded-full ${isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
          <span>{isAuthenticated ? (user?.username || 'Đã kết nối') : 'Đăng nhập'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-40 items-center gap-2 rounded-lg border border-[#dce9ff] dark:border-slate-700 bg-[#eff4ff] dark:bg-slate-800 px-2.5 py-1.5 text-[#64748b] dark:text-slate-300 transition-all hover:bg-[#e5eeff] dark:hover:bg-slate-700 sm:w-52 lg:w-72"
        >
          <span className="material-symbols-outlined text-[17px] text-[#004ac6] dark:text-blue-400">
            search
          </span>
          <span className="flex-1 truncate text-left text-[12px] text-[#64748b] dark:text-slate-400">
            Search student or round...
          </span>
          <kbd className="hidden rounded bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-[#64748b] dark:text-slate-400 border border-[#dce9ff] dark:border-slate-700 shadow-xs sm:inline-block">
            ⌘K
          </kbd>
        </button>

        <NotificationBell />

        {/* Theme Selector Menu (Light / Dark / System) */}
        <div className="relative" ref={themeRef}>
          <button
            type="button"
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
            title={`Giao diện: ${themeLabel} (Nhấp để chọn Sáng / Tối / Hệ thống)`}
          >
            <span className={`material-symbols-outlined text-[18px] ${
              themeMode === 'light' ? 'text-amber-500' :
              themeMode === 'dark' ? 'text-indigo-400' :
              'text-blue-500'
            }`}>
              {themeIcon}
            </span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">
              arrow_drop_down
            </span>
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 overflow-hidden">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Giao diện hệ thống
              </div>
              <button
                type="button"
                onClick={() => {
                  setThemeMode('light');
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-[12px] flex items-center justify-between transition-colors ${
                  themeMode === 'light'
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-amber-500">light_mode</span>
                  <span>Sáng (Light)</span>
                </div>
                {themeMode === 'light' && <span className="material-symbols-outlined text-[16px] text-amber-600">check</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setThemeMode('dark');
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-[12px] flex items-center justify-between transition-colors ${
                  themeMode === 'dark'
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-indigo-400">dark_mode</span>
                  <span>Tối (Dark)</span>
                </div>
                {themeMode === 'dark' && <span className="material-symbols-outlined text-[16px] text-indigo-500">check</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setThemeMode('system');
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-[12px] flex items-center justify-between transition-colors ${
                  themeMode === 'system'
                    ? 'bg-blue-50/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-blue-500">desktop_windows</span>
                  <span>Hệ thống (OS)</span>
                </div>
                {themeMode === 'system' && <span className="material-symbols-outlined text-[16px] text-blue-500">check</span>}
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex cursor-pointer items-center gap-2 rounded-lg py-1 pl-1 pr-1 transition-colors hover:bg-[#eff4ff] dark:hover:bg-slate-800"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'User')}&background=004AC6&color=fff`}
              alt="Profile avatar"
              className="h-8 w-8 rounded-full border border-[#dce9ff] dark:border-slate-700 object-cover"
            />
            <div className="hidden text-left sm:flex sm:flex-col">
              <span className="max-w-[110px] truncate text-[12px] font-medium leading-tight text-[#0b1c30] dark:text-slate-200">
                {user?.fullName || user?.username || 'Chưa đăng nhập'}
              </span>
              <span className="mt-0.5 inline-flex items-center justify-center rounded-full border border-[#dce9ff] dark:border-blue-900/60 bg-[#eff4ff] dark:bg-blue-950/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-none text-[#004ac6] dark:text-blue-400">
                {(user?.role || currentRole).toUpperCase()}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#64748b] dark:text-slate-400">
              keyboard_arrow_down
            </span>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-[#e2e8f0] dark:border-slate-800 py-1 z-50 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#0b1c30] dark:text-slate-200 hover:bg-[#f8fafc] dark:hover:bg-slate-800 hover:text-[#004ac6] dark:hover:text-blue-400 transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Xem thông tin tài khoản
              </button>
              
              <div className="h-[1px] bg-[#f1f5f9] dark:bg-slate-800 w-full my-0.5"></div>
              
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#ba1a1a] dark:text-rose-400 hover:bg-[#fff5f5] dark:hover:bg-rose-950/40 transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
