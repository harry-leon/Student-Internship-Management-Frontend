import React, { useState, useEffect, useCallback } from 'react';
import { UserAccount, Role } from '../types';
import { userService, UserQueryParams } from '../api/services';
import { mapUserFromDTO } from '../api/mappers';

interface UsersViewProps {
  users: UserAccount[];
  onRefreshData?: () => void;
}

export const UsersView: React.FC<UsersViewProps> = ({ users: initialUsers, onRefreshData }) => {
  // Query Params State
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('userId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(15);
  const [search, setSearch] = useState('');

  // Data State
  const [userList, setUserList] = useState<UserAccount[]>(initialUsers);
  const [totalElements, setTotalElements] = useState<number>(initialUsers.length);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch Users directly using Spring Boot GET /api/users endpoint
  const fetchUsersFromApi = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const params: UserQueryParams = {
        page,
        size,
        sortBy,
        sortDirection,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
      };

      const res = await userService.getAll(params);
      const mapped = (res as any[]).map(mapUserFromDTO);
      setUserList(mapped);

      // Access Pageable metadata if attached by apiClient
      const pageInfo = (res as any)?._page;
      if (pageInfo) {
        setTotalElements(pageInfo.totalElements);
        setTotalPages(pageInfo.totalPages);
      } else {
        setTotalElements(mapped.length);
        setTotalPages(Math.ceil(mapped.length / size) || 1);
      }
    } catch (err: any) {
      console.warn('Error fetching users from GET /api/users:', err);
      setErrorMsg(err.message || 'Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  }, [page, size, sortBy, sortDirection, roleFilter]);

  // Refetch when query parameters change
  useEffect(() => {
    fetchUsersFromApi();
  }, [fetchUsersFromApi]);

  // Client-side search filter
  const filteredUsers = userList.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  });

  const handleRoleChange = (newRole: string) => {
    setRoleFilter(newRole);
    setPage(0);
  };

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) {
      setFormError('Vui lòng điền đầy đủ Tên đăng nhập và Họ tên');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await userService.create({
        username,
        fullName,
        email: email || `${username}@fpt.edu.vn`,
        role,
        isActive: true,
      });

      setIsAddModalOpen(false);
      setUsername('');
      setFullName('');
      setEmail('');
      fetchUsersFromApi();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFormError(err.message || 'Không thể tạo tài khoản người dùng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-200">
      {/* Header */}
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[18px] font-bold text-[#0b1c30] tracking-tight">
            Quản Lý Tài Khoản Người Dùng
          </h1>
          <p className="mt-0.5 text-[12px] text-[#64748b]">
            Quản lý danh sách tài khoản, phân quyền vai trò và trạng thái hoạt động trong hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#004ac6] px-3 py-1.5 text-[11.5px] font-semibold text-white shadow-xs transition-all hover:bg-[#003ea8]"
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            <span>Thêm tài khoản</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Search & Role Filter Buttons */}
      <div className="mb-3 flex flex-col items-center justify-between gap-2 rounded-xl border border-[#e2e8f0] bg-white p-2.5 shadow-xs md:flex-row">
        <div className="flex w-full flex-1 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8f9ff] px-2.5 py-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#64748b]">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, phòng ban..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-[12.5px] outline-none text-[#0b1c30] placeholder-[#94a3b8] bg-transparent"
          />
        </div>

        {/* Role Filter Buttons */}
        <div className="flex w-full items-center justify-center gap-1 rounded-lg border border-[#dce9ff] bg-[#eff4ff] p-0.5 md:w-auto">
          <span className="px-1.5 text-[11px] font-semibold text-[#64748b]">Vai trò:</span>
          {[
            { id: 'ALL', label: 'TẤT CẢ' },
            { id: 'Admin', label: 'ADMIN' },
            { id: 'Mentor', label: 'MENTOR' },
            { id: 'Student', label: 'STUDENT' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRoleChange(r.id)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                roleFilter === r.id
                  ? 'bg-[#004ac6] text-white shadow-xs'
                  : 'text-[#64748b] hover:text-[#0b1c30]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="relative rounded-xl border border-[#e2e8f0] bg-white p-3 shadow-xs">
        {/* Loading Overlay Bar */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
            <div className="flex animate-pulse items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Đang tải dữ liệu...</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-2.5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            <span>{errorMsg}</span>
            <button
              onClick={() => fetchUsersFromApi()}
              className="rounded-md bg-red-600 px-2 py-0.5 font-semibold text-white hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        )}

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#dce9ff] bg-[#eff4ff] text-[10.5px] font-semibold uppercase tracking-wider text-[#434655]">
                <th
                  className="group cursor-pointer select-none rounded-l-lg px-3 py-2 transition-colors hover:bg-[#dce9ff]/70"
                  onClick={() => handleSortChange('userId')}
                  title="Sắp xếp theo Mã ID"
                >
                  <div className="flex items-center gap-1">
                    <span>MÃ ID</span>
                    <span className={`text-[11px] transition-colors ${sortBy === 'userId' ? 'text-[#004ac6] font-bold' : 'text-[#94a3b8] opacity-40 group-hover:opacity-100'}`}>
                      {sortBy === 'userId' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  className="group cursor-pointer select-none px-3 py-2 transition-colors hover:bg-[#dce9ff]/70"
                  onClick={() => handleSortChange('username')}
                  title="Sắp xếp theo Tên tài khoản"
                >
                  <div className="flex items-center gap-1">
                    <span>TÀI KHOẢN</span>
                    <span className={`text-[11px] transition-colors ${sortBy === 'username' || sortBy === 'fullName' ? 'text-[#004ac6] font-bold' : 'text-[#94a3b8] opacity-40 group-hover:opacity-100'}`}>
                      {sortBy === 'username' || sortBy === 'fullName' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>
                <th
                  className="group cursor-pointer select-none px-3 py-2 transition-colors hover:bg-[#dce9ff]/70"
                  onClick={() => handleSortChange('role')}
                  title="Sắp xếp theo Vai trò"
                >
                  <div className="flex items-center gap-1">
                    <span>VAI TRÒ</span>
                    <span className={`text-[11px] transition-colors ${sortBy === 'role' ? 'text-[#004ac6] font-bold' : 'text-[#94a3b8] opacity-40 group-hover:opacity-100'}`}>
                      {sortBy === 'role' ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  </div>
                </th>
                <th className="px-3 py-2">KHOA / BỘ MÔN</th>
                <th className="px-3 py-2">TRẠNG THÁI</th>
                <th className="rounded-r-lg px-2.5 py-2 text-right">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[12px] text-[#0b1c30]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#64748b]">
                    <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <span className="material-symbols-outlined text-[20px]">group</span>
                    </div>
                    <p className="text-sm font-bold text-[#0b1c30]">Chưa có người dùng</p>
                    <p className="mx-auto mt-0.5 max-w-md text-[11.5px] text-[#64748b]">
                      Không tìm thấy kết quả phù hợp với điều kiện lọc hiện tại.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === 'Admin';
                  const isMentor = u.role === 'Mentor';

                  return (
                    <tr key={u.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                      <td className="px-3 py-2 font-mono font-semibold text-[#64748b]">#{u.id}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=004AC6&color=fff`}
                            alt={u.name}
                            className="h-8 w-8 rounded-full border border-[#e2e8f0] object-cover"
                          />
                          <div className="min-w-0">
                            <div className="max-w-[260px] truncate text-[12.5px] font-semibold leading-tight text-[#0b1c30]">{u.name}</div>
                            <div className="max-w-[260px] truncate text-[11px] text-[#64748b]">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {isAdmin && (
                          <span className="inline-flex items-center rounded-full border border-[#e9d5ff] bg-[#f3e8ff] px-2 py-0.5 text-[10px] font-bold text-[#6b21a8]">
                            ADMIN
                          </span>
                        )}
                        {isMentor && (
                          <span className="inline-flex items-center rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2 py-0.5 text-[10px] font-bold text-[#1d4ed8]">
                            MENTOR
                          </span>
                        )}
                        {!isAdmin && !isMentor && (
                          <span className="inline-flex items-center rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[10px] font-bold text-[#334155]">
                            STUDENT
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[#434655]">{u.department || 'Khoa CNTT'}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-2.5 py-2 text-right">
                        <button
                          type="button"
                          className="rounded-md p-1 text-[#737686] transition-colors hover:bg-[#e5eeff] hover:text-[#0b1c30]"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            more_horiz
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Bar */}
        <div className="mt-3 flex flex-col items-center justify-between gap-2 border-t border-[#f1f5f9] pt-2.5 text-[11.5px] text-[#64748b] sm:flex-row">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              Hiển thị <strong className="text-[#0b1c30]">{userList.length}</strong> người dùng (Tổng số: <strong className="text-[#0b1c30]">{totalElements}</strong> phần tử)
            </div>
            <div className="flex items-center gap-1 rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[11px]">
              <span className="font-medium text-[#64748b]">Kích thước:</span>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                className="bg-transparent font-semibold text-[#004ac6] outline-none cursor-pointer"
              >
                <option value={5}>5 / trang</option>
                <option value={10}>10 / trang</option>
                <option value={15}>15 / trang</option>
                <option value={25}>25 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex cursor-pointer items-center gap-0.5 rounded-md border border-[#dce9ff] bg-[#eff4ff] px-2 py-0.5 text-[11px] font-semibold text-[#004ac6] transition-all disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[15px]">chevron_left</span>
              <span>Trước</span>
            </button>

            <span className="rounded-md border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 text-[11px] font-semibold text-[#0b1c30]">
              Trang {page + 1} / {Math.max(1, totalPages)}
            </span>

            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex cursor-pointer items-center gap-0.5 rounded-md border border-[#dce9ff] bg-[#eff4ff] px-2 py-0.5 text-[11px] font-semibold text-[#004ac6] transition-all disabled:opacity-40"
            >
              <span>Sau</span>
              <span className="material-symbols-outlined text-[15px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-[#f1f5f9] pb-2">
              <h3 className="text-sm font-bold text-[#0b1c30]">Thêm tài khoản mới</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#64748b] hover:text-[#0b1c30]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-2.5">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Tên Đăng Nhập (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: user01, mentor02..."
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Họ và Tên (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A..."
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Email Xác Thực
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@fpt.edu.vn"
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Vai Trò (Role) *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#2563eb]"
                >
                  <option value="Admin">Admin (Quản trị viên)</option>
                  <option value="Mentor">Mentor (Giảng viên hướng dẫn)</option>
                  <option value="Student">Student (Sinh viên thực tập)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#f1f5f9] pt-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:bg-[#e2e8f0]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#004ac6] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8]"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
