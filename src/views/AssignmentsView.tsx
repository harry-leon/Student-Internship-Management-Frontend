import React, { useState, useEffect, useCallback } from 'react';
import { Assignment, Role } from '../types';
import { assignmentService, studentService, mentorService, phaseService, StudentDTO, MentorDTO, InternshipPhaseDTO } from '../api/services';
import { mapAssignmentFromDTO } from '../api/mappers';
import { canManageSystemData } from '../auth/roleAccess';

interface AssignmentsViewProps {
  currentRole: Role;
  onSelectAssignment: (assignment: Assignment) => void;
  onOpenQuickAction?: () => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  currentRole,
  onSelectAssignment,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');
  const canManage = canManageSystemData(currentRole);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<StudentDTO[]>([]);
  const [availableMentors, setAvailableMentors] = useState<MentorDTO[]>([]);
  const [availablePhases, setAvailablePhases] = useState<InternshipPhaseDTO[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [selectedMentorId, setSelectedMentorId] = useState<number>(0);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await assignmentService.getAll();
      let arr = [];
      if (Array.isArray(res)) arr = res;
      else if (typeof res === 'object' && Array.isArray((res as any).content)) arr = (res as any).content;
      else if (typeof res === 'object' && Array.isArray((res as any).data)) arr = (res as any).data;

      setAssignments(arr.map(mapAssignmentFromDTO));
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleOpenCreate = async () => {
    setFormError(null);
    setIsCreateModalOpen(true);
    try {
      const [stdRes, mntRes, phRes] = await Promise.all([
        studentService.getAll().catch(() => []),
        mentorService.getAll().catch(() => []),
        phaseService.getAll().catch(() => []),
      ]);
      const stdList = Array.isArray(stdRes) ? stdRes : [];
      const mntList = Array.isArray(mntRes) ? mntRes : [];
      const phList = Array.isArray(phRes) ? phRes : [];

      setAvailableStudents(stdList);
      setAvailableMentors(mntList);
      setAvailablePhases(phList);

      if (stdList.length > 0) setSelectedStudentId(stdList[0].studentId);
      if (mntList.length > 0) setSelectedMentorId(mntList[0].mentorId);
      if (phList.length > 0) setSelectedPhaseId(phList[0].phaseId);
    } catch (err) {
      console.error('Error loading options for assignment creation:', err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedMentorId || !selectedPhaseId) {
      setFormError('Vui lòng chọn đầy đủ Sinh viên, Giảng viên và Đợt thực tập');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await assignmentService.create({
        studentId: selectedStudentId,
        mentorId: selectedMentorId,
        phaseId: selectedPhaseId,
      });
      setIsCreateModalOpen(false);
      fetchAssignments();
    } catch (err: any) {
      setFormError(err.message || 'Không thể tạo phân công thực tập');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string, studentName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa/hủy phân công của sinh viên "${studentName}"?`)) {
      return;
    }
    try {
      await assignmentService.delete(Number(assignmentId));
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa phân công');
    }
  };

  const filtered = assignments.filter((asg) => {
    const matchSearch =
      asg.studentName.toLowerCase().includes(search.toLowerCase()) ||
      asg.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      asg.mentorName.toLowerCase().includes(search.toLowerCase()) ||
      (asg.companyName && asg.companyName.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || asg.status === statusFilter;
    const matchPhase = phaseFilter === 'ALL' || asg.phase === phaseFilter;

    return matchSearch && matchStatus && matchPhase;
  });

  return (
    <div className="flex w-full flex-col animate-in fade-in duration-200 space-y-3.5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">assignment_ind</span>
            <h1 className="text-[20px] font-bold tracking-tight text-[#0b1c30]">
              Danh Mục Phân Công Thực Tập
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Quản lý phân công sinh viên - giảng viên hướng dẫn, doanh nghiệp thực tập và trạng thái.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Phân Công Mới</span>
          </button>
        )}
      </div>

      {/* Toolbar Filters */}
      <div className="grid gap-2.5 rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs sm:grid-cols-[minmax(0,1fr)_160px_160px]">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-1.5">
          <span className="material-symbols-outlined text-[17px] text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên SV, mã SV, giảng viên, công ty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-[#0b1c30] outline-none placeholder:text-slate-400"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-slate-400 hover:text-slate-700"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          )}
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-[#0b1c30] outline-none focus:border-[#004ac6]"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="PENDING">PENDING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div>
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-[#0b1c30] outline-none focus:border-[#004ac6]"
          >
            <option value="ALL">Tất cả đợt thực tập</option>
            <option value="Spring 2026">Spring 2026</option>
            <option value="Summer 2026">Summer 2026</option>
            <option value="Fall 2026">Fall 2026</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                <th className="px-3.5 py-2.5">Sinh Viên</th>
                <th className="px-3 py-2.5">Giảng Viên Hướng Dẫn</th>
                <th className="px-3 py-2.5">Doanh Nghiệp Thực Tập</th>
                <th className="px-3 py-2.5">Đợt Thực Tập</th>
                <th className="px-3 py-2.5">Ngày Đăng Ký</th>
                <th className="px-3 py-2.5 text-center">Bài Nộp</th>
                <th className="px-3 py-2.5 text-center">Trạng Thái</th>
                <th className="px-3 py-2.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#004ac6] border-t-transparent"></div>
                      <span>Đang tải danh sách phân công thực tập...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Không tìm thấy dữ liệu phân công thực tập.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onSelectAssignment(row)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={row.studentAvatar}
                          alt={row.studentName}
                          className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-[#004ac6] transition-colors">
                            {row.studentName}
                          </div>
                          <span className="font-mono text-[10.5px] text-[#004ac6]">
                            {row.studentCode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-900">{row.mentorName}</div>
                      <div className="text-[10.5px] text-slate-500">{row.mentorDept}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-slate-800">
                        {row.companyName || 'Campus Lab'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{row.phase}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500">{row.date}</td>
                    <td className="px-3 py-2.5 text-center">
                      {row.latestSubmissionType ? (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#004ac6] border border-blue-200">
                          {row.latestSubmissionType}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Chưa nộp</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {row.status === 'IN PROGRESS' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#004ac6]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#004ac6]"></span>
                          IN PROGRESS
                        </span>
                      )}
                      {row.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-purple-600"></span>
                          PENDING
                        </span>
                      )}
                      {row.status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
                          COMPLETED
                        </span>
                      )}
                      {row.status === 'CANCELLED' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
                          CANCELLED
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAssignment(row);
                        }}
                        className="inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-[#004ac6] transition-colors"
                        title="Xem chi tiết phân công"
                      >
                        <span className="material-symbols-outlined text-[13px]">visibility</span>
                        Chi tiết
                      </button>
                      {canManage && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssignment(row.id, row.studentName);
                          }}
                          className="inline-flex items-center gap-0.5 px-2 py-1 text-[11px] font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors"
                          title="Xóa phân công"
                        >
                          <span className="material-symbols-outlined text-[13px]">delete</span>
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-3.5 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">assignment_ind</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">Tạo Phân Công Thực Tập Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5 p-5">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Sinh Viên *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                >
                  {availableStudents.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.fullName} ({s.studentCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Giảng Viên Hướng Dẫn *
                </label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                >
                  {availableMentors.map((m) => (
                    <option key={m.mentorId} value={m.mentorId}>
                      {m.fullName} ({m.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Đợt Thực Tập *
                </label>
                <select
                  value={selectedPhaseId}
                  onChange={(e) => setSelectedPhaseId(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                >
                  {availablePhases.map((p) => (
                    <option key={p.phaseId} value={p.phaseId}>
                      {p.phaseName}
                    </option>
                  ))}
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
                  {isSubmitting ? 'Đang phân công...' : 'Tạo Phân Công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
