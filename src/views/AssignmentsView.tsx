import React, { useState, useEffect } from 'react';
import { Assignment, Role } from '../types';
import { assignmentService } from '../api/services';
import { mapAssignmentFromDTO } from '../api/mappers';
import { canManageSystemData } from '../auth/roleAccess';

interface AssignmentsViewProps {
  currentRole: Role;
  onSelectAssignment: (assignment: Assignment) => void;
  onOpenQuickAction: () => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  currentRole,
  onSelectAssignment,
  onOpenQuickAction,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');
  const canManage = canManageSystemData(currentRole);

  useEffect(() => {
    setIsLoading(true);
    assignmentService.getAll()
      .then(res => {
        let arr = [];
        if (Array.isArray(res)) arr = res;
        else if (typeof res === 'object' && Array.isArray((res as any).content)) arr = (res as any).content;
        else if (typeof res === 'object' && Array.isArray((res as any).data)) arr = (res as any).data;

        setAssignments(arr.map(mapAssignmentFromDTO));
      })
      .catch(err => console.error('Error fetching assignments:', err))
      .finally(() => setIsLoading(false));
  }, []);

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
            onClick={onOpenQuickAction}
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

        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-[#0b1c30] outline-none"
        >
          <option value="ALL">Tất cả đợt thực tập</option>
          <option value="Fall 2026">Fall 2026</option>
          <option value="Spring 2027">Spring 2027</option>
          <option value="Summer 2026">Summer 2026</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-[#0b1c30] outline-none"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="IN PROGRESS">In Progress</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Tổng số phân công: <strong className="text-slate-800 font-semibold">{filtered.length}</strong></span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                <th className="px-3.5 py-2.5">Sinh Viên</th>
                <th className="px-3 py-2.5">Giảng Viên Hướng Dẫn</th>
                <th className="px-3 py-2.5">Doanh Nghiệp Tiếp Nhận</th>
                <th className="px-3 py-2.5">Đợt</th>
                <th className="px-3 py-2.5">Ngày Phân</th>
                <th className="px-3 py-2.5 text-center">Bài Nộp</th>
                <th className="px-3 py-2.5 text-center">Trạng Thái</th>
                <th className="px-3 py-2.5 text-right">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#004ac6]">
                    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-3 border-[#004ac6] border-t-transparent"></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Không có phân công nào khớp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onSelectAssignment(row)}
                    className="group cursor-pointer transition-colors hover:bg-blue-50/40"
                  >
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          className="h-8 w-8 rounded-full border border-slate-200 object-cover shadow-2xs"
                          src={row.studentAvatar}
                          alt={row.studentName}
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 group-hover:text-[#004ac6] transition-colors">
                            {row.studentName}
                          </span>
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
                          <span className="material-symbols-outlined text-[12px]">
                            {row.latestSubmissionType === 'GITHUB' ? 'code' : 'folder_zip'}
                          </span>
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
                    <td className="px-3 py-2.5 text-right">
                      <span className="inline-flex items-center text-slate-400 group-hover:text-[#004ac6] transition-colors">
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
