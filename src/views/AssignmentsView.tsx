import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Assignment, Role } from '../types';
import { assignmentService, studentService, mentorService, phaseService, StudentDTO, MentorDTO, InternshipPhaseDTO } from '../api/services';
import { mapAssignmentFromDTO } from '../api/mappers';
import { Can } from '../components/Can';
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState } from '../components/ui';
import { PermissionCode } from '../config/permissions.config';
import { UserCheck, Plus, Search, X, Eye, Trash2 } from 'lucide-react';

interface AssignmentsViewProps {
  currentRole: Role;
  onSelectAssignment: (assignment: Assignment) => void;
  onOpenQuickAction?: () => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  currentRole: _currentRole,
  onSelectAssignment,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');

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

  // Distinct phases from existing assignments for filter dropdown
  const distinctPhases = useMemo(() => {
    const set = new Set<string>();
    assignments.forEach((a) => {
      if (a.phase) set.add(a.phase);
    });
    return Array.from(set);
  }, [assignments]);

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
    <PageContainer>
      <PageHeader
        title="Danh Mục Phân Công Thực Tập"
        description="Quản lý phân công sinh viên - giảng viên hướng dẫn, doanh nghiệp thực tập và trạng thái."
        icon={UserCheck}
        actions={
          <Can permission={PermissionCode.ASSIGNMENT_CREATE}>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenCreate}
            >
              Phân Công Mới
            </Button>
          </Can>
        }
      />

      {/* Toolbar Filters */}
      <Card padding="compact">
        <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-1.5">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Tìm theo tên SV, mã SV, giảng viên, công ty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
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
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
            >
              <option value="ALL">Tất cả đợt thực tập</option>
              {distinctPhases.map((phase) => (
                <option key={phase} value={phase}>
                  {phase}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card padding="compact" className="overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-slate-800 dark:text-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#004ac6] dark:border-blue-400 border-t-transparent"></div>
                      <span>Đang tải danh sách phân công thực tập...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4">
                    <EmptyState
                      icon={UserCheck}
                      title="Không tìm thấy dữ liệu phân công"
                      description="Chưa có phân công thực tập nào khớp với bộ lọc hiện tại."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onSelectAssignment(row)}
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-300 font-bold flex items-center justify-center text-xs border border-slate-200 dark:border-slate-700 shrink-0">
                          {row.studentName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-[#004ac6] dark:group-hover:text-blue-400 transition-colors">
                            {row.studentName}
                          </div>
                          <span className="font-mono text-[10.5px] text-[#004ac6] dark:text-blue-400 font-medium">
                            {row.studentCode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{row.mentorName}</div>
                      <div className="text-[10.5px] text-slate-500 dark:text-slate-400">{row.mentorDept}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {row.companyName || 'Campus Lab'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{row.phase}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{row.date}</td>
                    <td className="px-3 py-2.5 text-center">
                      {row.latestSubmissionType ? (
                        <span className="inline-flex items-center gap-1 rounded bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-bold text-[#004ac6] dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                          {row.latestSubmissionType}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">Chưa nộp</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge status={row.status} dot />
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAssignment(row);
                        }}
                        title="Xem chi tiết"
                      >
                        Chi tiết
                      </Button>
                      <Can permission={PermissionCode.ASSIGNMENT_DELETE}>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssignment(row.id, row.studentName);
                          }}
                          title="Xóa phân công"
                        >
                          Xóa
                        </Button>
                      </Can>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Assignment Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#004ac6] dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tạo Phân Công Thực Tập Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5 p-5">
              {formError && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300">
                  Sinh Viên *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                >
                  {availableStudents.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.fullName} ({s.studentCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300">
                  Giảng Viên Hướng Dẫn *
                </label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                >
                  {availableMentors.map((m) => (
                    <option key={m.mentorId} value={m.mentorId}>
                      {m.fullName} ({m.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-slate-700 dark:text-slate-300">
                  Đợt Thực Tập *
                </label>
                <select
                  value={selectedPhaseId}
                  onChange={(e) => setSelectedPhaseId(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                >
                  {availablePhases.map((p) => (
                    <option key={p.phaseId} value={p.phaseId}>
                      {p.phaseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang phân công...' : 'Tạo Phân Công'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
