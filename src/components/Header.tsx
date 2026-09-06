import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavPage, Role } from '../types';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';

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
  users: { parent: 'People', current: 'Users' },
  students: { parent: 'People', current: 'Students' },
  mentors: { parent: 'People', current: 'Mentors' },
  'mentor-groups': { parent: 'People', current: 'Mentor Groups' },
  'internship-phases': { parent: 'Internship', current: 'Internship Phases' },
  assignments: { parent: 'Internship', current: 'Assignments' },
  'evaluation-criteria': { parent: 'Evaluation', current: 'Evaluation Criteria' },
  'assessment-rounds': { parent: 'Evaluation', current: 'Assessment Rounds' },
  'assessment-results': { parent: 'Evaluation', current: 'Assessment Results' },
  'role-permissions': { parent: 'System', current: 'Role & Permissions' },
  'admin-group-rooms': { parent: 'System', current: 'Quản Lý Phòng Nhóm' },
  'group-room': { parent: 'Mentor Groups', current: 'Phòng Làm Việc Nhóm' },
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
  const pathParts = location.pathname.split('/');
  const currentPagePath = pathParts.length > 2 ? pathParts[2] : 'dashboard';
  const currentPage = (currentPagePath as NavPage) || 'dashboard';

  const breadcrumb = PAGE_TITLES[currentPage] || { parent: 'Dashboard', current: 'Overview' };
  const { isAuthenticated, user, logout } = useAuth();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dark Mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex h-[56px] items-center justify-between border-b border-[#e2e8f0] bg-white/92 px-3 shadow-[0_1px_8px_rgba(0,0,0,0.03)] backdrop-blur-xl sm:px-4 lg:left-[228px] lg:px-6">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg p-1.5 text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0b1c30] lg:hidden"
          aria-label="Open sidebar menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12.5px] sm:text-[13px]">
          <span className="font-medium text-[#0b1c30]">{breadcrumb.parent}</span>
          <span className="material-symbols-outlined text-[14px] text-[#94a3b8]">
            chevron_right
          </span>
          <span className="text-[#64748b]">{breadcrumb.current}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenLoginModal}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all ${
            isAuthenticated
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
          title="Trạng thái tài khoản người dùng"
        >
          <span className={`h-2 w-2 rounded-full ${isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
          <span>{isAuthenticated ? (user?.username || 'Đã kết nối') : 'Đăng nhập'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-40 items-center gap-2 rounded-lg border border-[#dce9ff] bg-[#eff4ff] px-2.5 py-1.5 text-[#64748b] transition-all hover:bg-[#e5eeff] sm:w-52 lg:w-72"
        >
          <span className="material-symbols-outlined text-[17px] text-[#004ac6]">
            search
          </span>
          <span className="flex-1 truncate text-left text-[12px] text-[#64748b]">
            Search student or round...
          </span>
          <kbd className="hidden rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-[#64748b] border border-[#dce9ff] shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:inline-block">
            ⌘K
          </kbd>
        </button>

        <NotificationBell />

        {/* Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          title={isDarkMode ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex cursor-pointer items-center gap-2 rounded-lg py-1 pl-1 pr-1 transition-colors hover:bg-[#eff4ff]"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'User')}&background=004AC6&color=fff`}
              alt="Profile avatar"
              className="h-8 w-8 rounded-full border border-[#dce9ff] object-cover"
            />
            <div className="hidden text-left sm:flex sm:flex-col">
              <span className="max-w-[110px] truncate text-[12px] font-medium leading-tight text-[#0b1c30]">
                {user?.fullName || user?.username || 'Chưa đăng nhập'}
              </span>
              <span className="mt-0.5 inline-flex items-center justify-center rounded-full border border-[#dce9ff] bg-[#eff4ff] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider leading-none text-[#004ac6]">
                {(user?.role || currentRole).toUpperCase()}
              </span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#64748b]">
              keyboard_arrow_down
            </span>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#e2e8f0] py-1 z-50 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/admin/my-profile');
                }}
                className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#0b1c30] hover:bg-[#f8fafc] hover:text-[#004ac6] transition-colors flex items-center gap-2.5"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Xem thông tin tài khoản
              </button>
              
              <div className="h-[1px] bg-[#f1f5f9] w-full my-0.5"></div>
              
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#ba1a1a] hover:bg-[#fff5f5] transition-colors flex items-center gap-2.5"
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
