import React, { useState, useEffect, useCallback } from 'react';
import { Role, Student } from '../types';
import { studentService } from '../api/services';
import { mapStudentFromDTO } from '../api/mappers';
import { canManageSystemData } from '../auth/roleAccess';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { Can } from '../components/Can';

interface StudentsViewProps {
  currentRole: Role;
  onOpenAddStudent?: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  currentRole,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const canManage = canManageSystemData(currentRole);

  // CRUD Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Create Form
  const [createCode, setCreateCode] = useState('');
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createMajor, setCreateMajor] = useState('Software Engineering');
  const [createClass, setCreateClass] = useState('');

  // Edit Form
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMajor, setEditMajor] = useState('');
  const [editClass, setEditClass] = useState('');

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await studentService.getAll();
      let arr = [];
      if (Array.isArray(res)) arr = res;
      else if (typeof res === 'object' && Array.isArray((res as any).content)) arr = (res as any).content;
      else if (typeof res === 'object' && Array.isArray((res as any).data)) arr = (res as any).data;

      setStudents(arr.map(mapStudentFromDTO));
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'ALL' || s.department === deptFilter;
    return matchSearch && matchDept;
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createCode.trim() || !createName.trim()) {
      setFormError('Mã số sinh viên và Họ tên không được để trống');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await studentService.create({
        studentCode: createCode,
        fullName: createName,
        email: createEmail || `${createCode.toLowerCase()}@fpt.edu.vn`,
        phoneNumber: createPhone,
        major: createMajor,
        className: createClass,
      });
      setIsCreateModalOpen(false);
      setCreateCode('');
      setCreateName('');
      setCreateEmail('');
      setCreatePhone('');
      setCreateClass('');
      fetchStudents();
    } catch (err: any) {
      setFormError(err.message || 'Không thể thêm sinh viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setEditName(s.name);
    setEditMajor(s.department || 'Software Engineering');
    setEditPhone('');
    setEditClass('');
    setFormError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editName.trim()) {
      setFormError('Họ tên không được để trống');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await studentService.update(Number(editingStudent.id), {
        fullName: editName,
        major: editMajor,
        className: editClass || undefined,
        phoneNumber: editPhone || undefined,
      });
      setEditingStudent(null);
      fetchStudents();
    } catch (err: any) {
      setFormError(err.message || 'Không thể cập nhật thông tin sinh viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setIsSubmitting(true);
    try {
      await studentService.delete(Number(deletingStudent.id));
      setDeletingStudent(null);
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa hồ sơ sinh viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full flex-col animate-in fade-in duration-200 space-y-3.5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">school</span>
            <h1 className="text-[20px] font-bold tracking-tight text-[#0b1c30]">
              Danh Sách Sinh Viên Thực Tập
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Quản lý hồ sơ thực tập, đơn vị tiếp nhận và tiến độ hoàn thành của sinh viên.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Can permission="STUDENT_CREATE">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>Thêm Sinh Viên Mới</span>
            </button>
          </Can>
        </div>
      </div>

      {/* Search & Filter & View Switcher Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc mã sinh viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 rounded-lg border border-slate-200 bg-slate-50/70 pl-8 pr-3 text-xs text-[#0b1c30] placeholder-slate-400 outline-none focus:border-[#004ac6] focus:bg-white transition-colors"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-[16px] text-slate-400">
            search
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-[#0b1c30] outline-none"
          >
            <option value="ALL">Tất cả ngành học</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Information Systems">Information Systems</option>
            <option value="Computer Science">Computer Science</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Chế độ bảng"
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#004ac6] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] block">table_rows</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Chế độ thẻ"
              className={`p-1 rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-white text-[#004ac6] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px] block">grid_view</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-[#004ac6]">
          <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#004ac6] border-t-transparent"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200/90 bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#004ac6]">
            <span className="material-symbols-outlined text-[22px]">school</span>
          </div>
          <h3 className="text-sm font-semibold text-[#0b1c30]">Chưa có dữ liệu sinh viên</h3>
          <p className="mt-1 text-xs text-slate-500">Hãy thêm sinh viên vào hệ thống để bắt đầu theo dõi tiến độ thực tập.</p>
          {canManage && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#003896] transition-colors"
            >
              + Thêm Sinh Viên Mới
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Danh sách sinh viên: <strong className="text-slate-800 font-semibold">{filtered.length}</strong></span>
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-3.5 py-2.5">Sinh Viên</th>
                  <th className="px-3 py-2.5">Chuyên Ngành</th>
                  <th className="px-3 py-2.5">Doanh Nghiệp Thực Tập</th>
                  <th className="px-3 py-2.5">Giảng Viên Hướng Dẫn</th>
                  <th className="px-3 py-2.5">Đợt</th>
                  <th className="px-3 py-2.5">Tiến Độ</th>
                  <th className="px-3 py-2.5 text-center">Điểm</th>
                  <th className="px-3.5 py-2.5 text-center">Trạng Thái</th>
                  <th className="px-3.5 py-2.5 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <div className="font-semibold text-slate-900">{s.name}</div>
                          <div className="font-mono text-[10.5px] text-[#004ac6]">{s.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{s.department}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{s.company}</td>
                    <td className="px-3 py-2.5 text-slate-600">{s.mentor}</td>
                    <td className="px-3 py-2.5 text-slate-500 font-medium">{s.phase}</td>
                    <td className="px-3 py-2.5">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                          <span>{s.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#004ac6]"
                            style={{ width: `${s.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-slate-900">
                      {s.score != null ? `${s.score}/10` : '--'}
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#004ac6]">
                        {s.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentId(Number(s.id))}
                        className="inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-[#004ac6] transition-colors shadow-2xs"
                        title="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined text-[13px]">visibility</span>
                        Chi tiết
                      </button>
                      <Can permission="STUDENT_UPDATE">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-medium text-[#004ac6] bg-blue-50/70 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors shadow-2xs"
                          title="Sửa thông tin"
                        >
                          <span className="material-symbols-outlined text-[13px]">edit</span>
                          Sửa
                        </button>
                      </Can>
                      <Can permission="STUDENT_DELETE">
                        <button
                          type="button"
                          onClick={() => setDeletingStudent(s)}
                          className="inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-medium text-rose-600 bg-rose-50/70 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors shadow-2xs"
                          title="Xóa sinh viên"
                        >
                          <span className="material-symbols-outlined text-[13px]">delete</span>
                          Xóa
                        </button>
                      </Can>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-2.5">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="h-9 w-9 rounded-lg border border-slate-200 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-semibold text-[#0b1c30]">
                      {student.name}
                    </h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      <span className="rounded border border-blue-100 bg-blue-50 px-1 py-0.2 font-mono text-[9.5px] font-medium text-[#004ac6]">
                        {student.code}
                      </span>
                      <span className="truncate text-[10px] text-slate-500">{student.department}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 grid gap-0.5 rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-[10.5px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Doanh nghiệp</span>
                    <span className="max-w-[58%] truncate font-medium text-slate-800">{student.company}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Giảng viên</span>
                    <span className="max-w-[58%] truncate font-medium text-slate-800">{student.mentor}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Đợt</span>
                    <span className="max-w-[58%] truncate font-medium text-slate-800">{student.phase}</span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="mb-0.5 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Tiến độ</span>
                    <span className="font-semibold text-[#004ac6]">{student.progress}%</span>
                  </div>
                  <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#004ac6]"
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-[10.5px]">
                    <span className="text-slate-500">
                      Điểm: <strong className="text-slate-900">{student.score ?? 0}/10</strong>
                    </span>
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-1.5 py-0.2 text-[9px] font-bold text-[#004ac6]">
                      {student.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedStudentId(Number(student.id))}
                  className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-md hover:bg-slate-100 hover:text-[#004ac6] transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px]">visibility</span>
                  Chi tiết
                </button>
                <Can permission="STUDENT_UPDATE">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(student)}
                    className="p-1 text-[#004ac6] bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                    title="Sửa thông tin"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                  </button>
                </Can>
                <Can permission="STUDENT_DELETE">
                  <button
                    type="button"
                    onClick={() => setDeletingStudent(student)}
                    className="p-1 text-rose-600 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors"
                    title="Xóa sinh viên"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </Can>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Student Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-3.5 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">person_add</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">Thêm Sinh Viên Thực Tập Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 p-5">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                    Mã Sinh Viên (MSSV) *
                  </label>
                  <input
                    type="text"
                    required
                    value={createCode}
                    onChange={(e) => setCreateCode(e.target.value.toUpperCase())}
                    placeholder="VD: SE190099"
                    className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                    Lớp Sinh Hoạt
                  </label>
                  <input
                    type="text"
                    value={createClass}
                    onChange={(e) => setCreateClass(e.target.value)}
                    placeholder="VD: SE1911"
                    className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Họ và Tên Sinh Viên *
                </label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Nguyễn Văn A..."
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="sv@fpt.edu.vn"
                    className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Chuyên Ngành
                </label>
                <select
                  value={createMajor}
                  onChange={(e) => setCreateMajor(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Information Systems">Information Systems</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#f1f5f9] pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:bg-[#e2e8f0]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8]"
                >
                  {isSubmitting ? 'Đang thêm...' : 'Thêm Sinh Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-3.5 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">edit</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">
                  Cập Nhật Hồ Sơ Sinh Viên ({editingStudent.code})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 p-5">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Họ và Tên Sinh Viên *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                    Lớp Sinh Hoạt
                  </label>
                  <input
                    type="text"
                    value={editClass}
                    onChange={(e) => setEditClass(e.target.value)}
                    placeholder="VD: SE1911"
                    className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Chuyên Ngành
                </label>
                <select
                  value={editMajor}
                  onChange={(e) => setEditMajor(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Information Systems">Information Systems</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#f1f5f9] pt-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:bg-[#e2e8f0]"
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
      {deletingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30]">Xóa Hồ Sơ Sinh Viên</h3>
                <p className="text-xs text-slate-500">Xác nhận gỡ bỏ sinh viên</p>
              </div>
            </div>

            <p className="text-xs text-[#434655]">
              Bạn có chắc chắn muốn xóa sinh viên <strong>{deletingStudent.name}</strong> ({deletingStudent.code})?
              Nếu sinh viên đã có lịch phân công, hệ thống sẽ bảo lưu an toàn dữ liệu và đánh dấu trạng thái tương ứng.
            </p>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:bg-[#e2e8f0]"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
              >
                {isSubmitting ? 'Đang xóa...' : 'Xóa Sinh Viên'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={selectedStudentId !== null}
        onClose={() => setSelectedStudentId(null)}
        studentId={selectedStudentId}
      />
    </div>
  );
};
