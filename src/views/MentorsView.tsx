import React, { useState, useEffect, useCallback } from 'react';
import { Mentor, Role } from '../types';
import { mentorService } from '../api/services';
import { mapMentorFromDTO } from '../api/mappers';
import { Can } from '../components/Can';
import { useAuth } from '../context/AuthContext';
import { PermissionCode } from '../config/permissions.config';
import { PageContainer, PageHeader, Button, Badge } from '../components/ui';
import { uiConfig } from '../config/ui.config';

interface MentorsViewProps {
  currentRole?: Role;
}

export const MentorsView: React.FC<MentorsViewProps> = ({ currentRole = 'Admin' }) => {
  const { can, user } = useAuth();
  const activeRole = (user?.role as Role) || currentRole;
  const canManage = activeRole === 'Admin' || (activeRole as string) === 'Manager' || can(PermissionCode.MENTOR_CREATE);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // CRUD Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [viewingMentor, setViewingMentor] = useState<Mentor | null>(null);
  const [deletingMentor, setDeletingMentor] = useState<Mentor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Create Form
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createDepartment, setCreateDepartment] = useState('Khoa CNTT');
  const [createAcademicRank, setCreateAcademicRank] = useState('Thạc sĩ');

  // Edit Form
  const [editName, setEditName] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editAcademicRank, setEditAcademicRank] = useState('');

  const fetchMentors = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await mentorService.getAll();
      let arr = [];
      if (Array.isArray(res)) arr = res;
      else if (typeof res === 'object' && Array.isArray((res as any).content)) arr = (res as any).content;
      else if (typeof res === 'object' && Array.isArray((res as any).data)) arr = (res as any).data;

      setMentors(arr.map(mapMentorFromDTO));
    } catch (err) {
      console.error('Error fetching mentors:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const filtered = mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase()) ||
      m.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      setFormError('Họ tên giảng viên không được để trống');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await mentorService.create({
        fullName: createName,
        email: createEmail || `${createName.toLowerCase().replace(/\s+/g, '')}@fpt.edu.vn`,
        department: createDepartment,
        academicRank: createAcademicRank,
      });
      setIsCreateModalOpen(false);
      setCreateName('');
      setCreateEmail('');
      setCreateDepartment('Khoa CNTT');
      setCreateAcademicRank('Thạc sĩ');
      fetchMentors();
    } catch (err: any) {
      setFormError(err.message || 'Không thể thêm giảng viên hướng dẫn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (m: Mentor) => {
    setEditingMentor(m);
    setEditName(m.name);
    setEditDepartment(m.department);
    setEditAcademicRank(m.title || 'ThS');
    setFormError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMentor) return;
    if (!editName.trim()) {
      setFormError('Họ tên không được để trống');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await mentorService.update(Number(editingMentor.id), {
        fullName: editName,
        department: editDepartment,
        academicRank: editAcademicRank,
      });
      setEditingMentor(null);
      fetchMentors();
    } catch (err: any) {
      setFormError(err.message || 'Không thể cập nhật thông tin giảng viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMentor) return;
    setIsSubmitting(true);
    try {
      await mentorService.delete(Number(deletingMentor.id));
      setDeletingMentor(null);
      fetchMentors();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa giảng viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Đội Ngũ Giảng Viên Hướng Dẫn"
        description="Giảng viên cố vấn thực tập, hạn mức hướng dẫn và tỷ lệ phân công sinh viên."
        icon="supervisor_account"
        badge={
          <Badge status="completed">
            Tổng số: {mentors.length} giảng viên
          </Badge>
        }
        actions={
          <Can permission={PermissionCode.MENTOR_CREATE}>
            <Button
              variant="primary"
              icon="person_add"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Thêm Giảng Viên
            </Button>
          </Can>
        }
      />

      {/* Search Toolbar */}
      <div className="max-w-md rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-2xs">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/80 px-3 py-1.5">
          <span className="material-symbols-outlined text-[17px] text-slate-400 dark:text-slate-500">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, khoa, chuyên ngành..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-[#0b1c30] dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-[#004ac6] dark:text-blue-400">
          <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#004ac6] dark:border-blue-400 border-t-transparent"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-2xs">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#004ac6] dark:text-blue-400">
            <span className="material-symbols-outlined text-[22px]">supervisor_account</span>
          </div>
          <h3 className="text-sm font-semibold text-[#0b1c30] dark:text-slate-100">Chưa có dữ liệu Giảng viên</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Cơ sở dữ liệu backend hiện tại chưa ghi nhận danh sách giảng viên hướng dẫn.
          </p>
          {canManage && (
            <Button
              variant="primary"
              className="mt-3"
              onClick={() => setIsCreateModalOpen(true)}
            >
              + Thêm Giảng Viên
            </Button>
          )}
        </div>
      ) : (
        <div className={uiConfig.grid.cards3Col}>
          {filtered.map((mentor) => {
            const loadPercent = Math.round((mentor.activeStudents / mentor.maxCapacity) * 100);
            const isNearCapacity = loadPercent >= 90;

            return (
              <div
                key={mentor.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs transition-all hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
              >
                <div>
                  <div className="mb-2.5 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 object-cover shadow-2xs"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-[#0b1c30] dark:text-slate-100">
                          {mentor.name}
                        </h3>
                        <div className="text-[11px] font-semibold text-[#004ac6] dark:text-blue-400">
                          {mentor.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {mentor.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 rounded-md border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10.5px] font-bold text-amber-800 dark:text-amber-300">
                      <span className="material-symbols-outlined text-[13px] text-amber-500 dark:text-amber-400">
                        star
                      </span>
                      <span>{mentor.rating}</span>
                    </div>
                  </div>

                  <div className="mb-2.5 rounded-lg border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/40 p-2 text-[11px] text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Lĩnh vực: </span>
                    {mentor.specialization}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Chỉ tiêu & Tải trọng</span>
                    <span className={`font-semibold ${isNearCapacity ? 'text-amber-600 dark:text-amber-400' : 'text-[#004ac6] dark:text-blue-400'}`}>
                      {mentor.activeStudents} / {mentor.maxCapacity} ({loadPercent}%)
                    </span>
                  </div>
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${isNearCapacity ? 'bg-amber-500' : 'bg-[#004ac6] dark:bg-blue-500'}`}
                      style={{ width: `${loadPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="max-w-[150px] truncate text-slate-400 dark:text-slate-500">
                      {mentor.email}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setViewingMentor(mentor)}
                        className="inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined text-[12px]">visibility</span>
                        Chi tiết
                      </button>
                      <Can permission="MENTOR_UPDATE">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(mentor)}
                          className="rounded p-1 text-[#004ac6] hover:bg-blue-50"
                          title="Sửa thông tin"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                        </button>
                      </Can>
                      <Can permission="MENTOR_DELETE">
                        <button
                          type="button"
                          onClick={() => setDeletingMentor(mentor)}
                          className="rounded p-1 text-rose-600 hover:bg-rose-50"
                          title="Xóa giảng viên"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      </Can>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Mentor Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] dark:text-blue-400 text-[18px]">person_add</span>
                <h3 className="text-sm font-bold text-[#0b1c30] dark:text-slate-100">Thêm Giảng Viên Hướng Dẫn Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateMentor} className="space-y-3.5 p-5">
              {formError && (
                <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-2 text-xs text-red-700 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                  Họ và Tên Giảng Viên *
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="VD: TS. Lê Văn B..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                  Email Công Tác
                </label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="giangvien@fpt.edu.vn"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                    Khoa / Bộ Môn
                  </label>
                  <input
                    type="text"
                    value={createDepartment}
                    onChange={(e) => setCreateDepartment(e.target.value)}
                    placeholder="Khoa CNTT"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                    Học Hàm / Học Vị
                  </label>
                  <select
                    value={createAcademicRank}
                    onChange={(e) => setCreateAcademicRank(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                  >
                    <option value="Thạc sĩ">Thạc sĩ (ThS)</option>
                    <option value="Tiến sĩ">Tiến sĩ (TS)</option>
                    <option value="Phó Giáo Sư">Phó Giáo Sư (PGS)</option>
                    <option value="Giáo Sư">Giáo Sư (GS)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8]"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Mentor Modal */}
      {editingMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] dark:text-blue-400 text-[18px]">edit</span>
                <h3 className="text-sm font-bold text-[#0b1c30] dark:text-slate-100">
                  Cập Nhật Giảng Viên #{editingMentor.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMentor(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 p-5">
              {formError && (
                <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-2 text-xs text-red-700 dark:text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                  Họ và Tên Giảng Viên *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                    Khoa / Bộ Môn
                  </label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655] dark:text-slate-300">
                    Học Hàm / Học Vị
                  </label>
                  <input
                    type="text"
                    value={editAcademicRank}
                    onChange={(e) => setEditAcademicRank(e.target.value)}
                    placeholder="VD: TS, ThS..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingMentor(null)}
                  className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
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

      {/* View Detail Modal */}
      {viewingMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={viewingMentor.avatar}
                  alt={viewingMentor.name}
                  className="h-12 w-12 rounded-xl border border-slate-200 dark:border-slate-700 object-cover shadow-2xs"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#0b1c30] dark:text-slate-100">{viewingMentor.name}</h3>
                  <div className="text-xs font-semibold text-[#004ac6] dark:text-blue-400">{viewingMentor.title} • {viewingMentor.department}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingMentor(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Email:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingMentor.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Chuyên ngành hướng dẫn:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingMentor.specialization}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Số sinh viên đang nhận:</span>
                <span className="font-semibold text-[#004ac6] dark:text-blue-400">{viewingMentor.activeStudents} / {viewingMentor.maxCapacity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Đánh giá trung bình:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">★ {viewingMentor.rating} / 5.0</span>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setViewingMentor(null)}
                className="rounded-lg bg-[#004ac6] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30] dark:text-slate-100">Xóa Giảng Viên Hướng Dẫn</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Xác nhận gỡ bỏ giảng viên</p>
              </div>
            </div>

            <p className="text-xs text-[#434655] dark:text-slate-300">
              Bạn có chắc chắn muốn xóa giảng viên <strong>{deletingMentor.name}</strong>?
              Nếu giảng viên đã được phân công hướng dẫn sinh viên, hệ thống sẽ bảo lưu và khóa an toàn.
            </p>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setDeletingMentor(null)}
                className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
              >
                {isSubmitting ? 'Đang xóa...' : 'Xóa Giảng Viên'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

