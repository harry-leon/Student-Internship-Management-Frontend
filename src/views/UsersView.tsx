import React, { useState, useEffect, useCallback } from 'react';
import { UserAccount, Role } from '../types';
import { userService, UserQueryParams } from '../api/services';
import { mapUserFromDTO } from '../api/mappers';
import { Can } from '../components/Can';
import { PageContainer, PageHeader, Button, Badge } from '../components/ui';
import { PermissionCode } from '../config/permissions.config';

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
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserAccount | null>(null);

  // Form State
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit Form State
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<Role>('Student');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

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

  const handleOpenEdit = (u: UserAccount) => {
    setEditingUser(u);
    setEditFullName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditIsActive(u.status === 'Active');
    setFormError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editFullName.trim()) {
      setFormError('Họ tên không được để trống');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await userService.update(Number(editingUser.id), {
        fullName: editFullName,
        email: editEmail,
        role: editRole,
        isActive: editIsActive,
      });
      setEditingUser(null);
      fetchUsersFromApi();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFormError(err.message || 'Không thể cập nhật người dùng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (u: UserAccount) => {
    try {
      const nextStatus = u.status !== 'Active';
      await userService.updateStatus(Number(u.id), nextStatus);
      fetchUsersFromApi();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Không thể đổi trạng thái tài khoản');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    setIsSubmitting(true);
    try {
      await userService.delete(Number(deletingUser.id));
      setDeletingUser(null);
      fetchUsersFromApi();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa tài khoản');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Quản Lý Tài Khoản Người Dùng"
        description="Quản lý danh sách tài khoản, phân quyền vai trò và trạng thái hoạt động trong hệ thống."
        icon="manage_accounts"
        actions={
          <Can permission={PermissionCode.USER_CREATE}>
            <Button
              variant="primary"
              icon="person_add"
              onClick={() => setIsAddModalOpen(true)}
            >
              Thêm tài khoản
            </Button>
          </Can>
        }
      />

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
                        <Badge role={u.role}>{u.role}</Badge>
                      </td>
                      <td className="px-3 py-2 text-[#434655] dark:text-slate-300">{u.department || 'Khoa CNTT'}</td>
                      <td className="px-3 py-2">
                        <Badge status={u.status || 'Active'} dot>
                          {u.status || 'Active'}
                        </Badge>
                      </td>
                      <td className="px-2.5 py-2 text-right space-x-1 whitespace-nowrap">
                        <Can permission="USER_UPDATE">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="rounded-md p-1 text-[#004ac6] transition-colors hover:bg-[#dce9ff]"
                            title="Chỉnh sửa tài khoản"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            className={`rounded-md p-1 transition-colors ${
                              u.status !== 'Inactive'
                                ? 'text-emerald-600 hover:bg-emerald-50 hover:text-red-600'
                                : 'text-slate-400 hover:bg-slate-100 hover:text-emerald-600'
                            }`}
                            title={u.status !== 'Inactive' ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {u.status !== 'Inactive' ? 'check_circle' : 'block'}
                            </span>
                          </button>
                        </Can>
                        <Can permission="USER_DELETE">
                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            className="rounded-md p-1 text-rose-600 transition-colors hover:bg-rose-50"
                            title="Xóa tài khoản"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </Can>
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
          <div className="relative w-full max-w-sm rounded-xl border border-[#e2e8f0] dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between border-b border-[#f1f5f9] dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-[#0b1c30] dark:text-slate-100">Thêm tài khoản mới</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#64748b] hover:text-[#0b1c30] dark:text-slate-400 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-2.5">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                  Tên Đăng Nhập (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: user01, mentor02..."
                  className="w-full rounded-lg border border-[#e2e8f0] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                  Họ và Tên (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A..."
                  className="w-full rounded-lg border border-[#e2e8f0] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                  Email Xác Thực
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@fpt.edu.vn"
                  className="w-full rounded-lg border border-[#e2e8f0] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                  Vai Trò (Role) *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full rounded-lg border border-[#e2e8f0] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#2563eb]"
                >
                  <option value="Admin">Admin (Quản trị viên)</option>
                  <option value="Mentor">Mentor (Giảng viên hướng dẫn)</option>
                  <option value="Student">Student (Sinh viên thực tập)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#f1f5f9] dark:border-slate-800 pt-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg bg-[#f1f5f9] dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-[#64748b] dark:text-slate-300 hover:bg-[#e2e8f0] dark:hover:bg-slate-700"
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
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e2e8f0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-slate-800 px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] dark:text-blue-400 text-[18px]">edit</span>
                <h3 className="text-sm font-bold text-[#0b1c30] dark:text-slate-100">
                  Chỉnh Sửa Tài Khoản #{editingUser.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 p-5">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                  Tên tài khoản (Read-only)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingUser.username || ''}
                  className="w-full rounded-lg border border-[#e2e8f0] dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                  Họ và Tên *
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                  Vai Trò (Role)
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="w-full rounded-lg border border-[#e2e8f0] dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-400"
                >
                  <option value="Admin">Admin (Quản trị viên)</option>
                  <option value="Mentor">Mentor (Giảng viên hướng dẫn)</option>
                  <option value="Student">Student (Sinh viên thực tập)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#004ac6] focus:ring-[#004ac6]"
                />
                <label htmlFor="editIsActive" className="text-xs font-medium text-[#0b1c30] dark:text-slate-200">
                  Kích hoạt trạng thái hoạt động (Active)
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#f1f5f9] dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-lg bg-[#f1f5f9] dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-[#64748b] dark:text-slate-300 hover:bg-[#e2e8f0] dark:hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8]"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#e2e8f0] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30] dark:text-slate-100">Xác Nhận Xóa Tài Khoản</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hành động này không thể hoàn tác.</p>
              </div>
            </div>

            <p className="text-xs text-[#434655] dark:text-slate-300">
              Bạn có chắc chắn muốn xóa tài khoản <strong>{deletingUser.name}</strong> ({deletingUser.email}) khỏi hệ thống?
            </p>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="rounded-lg bg-[#f1f5f9] dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-[#64748b] dark:text-slate-300 hover:bg-[#e2e8f0] dark:hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
              >
                {isSubmitting ? 'Đang xóa...' : 'Xóa Tài Khoản'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
