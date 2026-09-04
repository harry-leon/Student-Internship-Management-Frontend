import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Assignment, InternshipPhase, AssessmentRound, Student, Mentor, Role } from '../types';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  phase: InternshipPhase;
  assignments: Assignment[];
  rounds: AssessmentRound[];
  students?: Student[];
  mentors?: Mentor[];
  currentRole?: Role;
  onOpenConfigurePhase: () => void;
  onOpenExportReport: () => void;
  onOpenQuickAction: () => void;
  onSelectAssignment: (assignment: Assignment) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  phase,
  assignments,
  rounds,
  students = [],
  mentors = [],
  currentRole = 'Admin',
  onOpenConfigurePhase,
  onOpenExportReport,
  onOpenQuickAction,
  onSelectAssignment,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const effectiveRole = user?.role ? (user.role as Role) : currentRole;

  const recentAssignments = assignments.slice(0, 5);

  const totalAssignments = assignments.length;
  const inProgressCount = assignments.filter((a) => a.status === 'IN PROGRESS').length;
  const pendingCount = assignments.filter((a) => a.status === 'PENDING').length;
  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length;
  const cancelledCount = assignments.filter((a) => a.status === 'CANCELLED').length;

  const inProgressPct = totalAssignments > 0 ? Math.round((inProgressCount / totalAssignments) * 100) : 0;
  const pendingPct = totalAssignments > 0 ? Math.round((pendingCount / totalAssignments) * 100) : 0;
  const completedPct = totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0;
  const cancelledPct = totalAssignments > 0 ? Math.round((cancelledCount / totalAssignments) * 100) : 0;

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-200">
      {/* Top Title & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-bold text-[#0b1c30] tracking-tight">
              {effectiveRole === 'Admin' && 'Dashboard Quản Trị Viên (Admin)'}
              {effectiveRole === 'Mentor' && 'Dashboard Giảng Viên Hướng Dẫn'}
              {effectiveRole === 'Student' && 'Cổng Thông Tin Sinh Viên Thực Tập'}
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
              {effectiveRole}
            </span>
          </div>
          <p className="text-[12.5px] text-[#64748b] mt-0.5">
            {effectiveRole === 'Admin' && 'Quản lý toàn bộ đợt thực tập, phân công mentor và các tiêu chí đánh giá.'}
            {effectiveRole === 'Mentor' && 'Theo dõi danh sách sinh viên phụ trách, nhật ký công việc và chấm điểm.'}
            {effectiveRole === 'Student' && 'Tra cứu thông tin đợt thực tập cá nhân, tiến độ phân công và điểm số kết quả.'}
          </p>
        </div>

        {/* Action Buttons tailored by Role */}
        <div className="flex items-center gap-2.5">
          {effectiveRole === 'Admin' && (
            <>
              <button
                type="button"
                onClick={onOpenExportReport}
                className="px-3 py-2 text-[12px] font-semibold text-[#004ac6] bg-[#eff4ff] hover:bg-[#e5eeff] rounded-xl border border-[#dce9ff] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Xuất Báo Cáo</span>
              </button>
              <button
                type="button"
                onClick={onOpenConfigurePhase}
                className="px-3 py-2 text-[12px] font-semibold text-[#004ac6] bg-[#eff4ff] hover:bg-[#e5eeff] rounded-xl border border-[#dce9ff] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">settings</span>
                <span>Cấu Hình Đợt</span>
              </button>
              <button
                type="button"
                onClick={onOpenQuickAction}
                className="px-3.5 py-2 text-[12px] font-semibold text-white bg-[#004ac6] hover:bg-[#003ea8] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Thêm Phân Công</span>
              </button>
            </>
          )}

          {effectiveRole === 'Mentor' && (
            <>
              <button
                type="button"
                onClick={() => navigate('/admin/assessment-results')}
                className="px-3.5 py-2 text-[12px] font-semibold text-white bg-[#004ac6] hover:bg-[#003ea8] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">edit_square</span>
                <span>Chấm Điểm Sinh Viên</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/students')}
                className="px-3 py-2 text-[12px] font-semibold text-[#004ac6] bg-[#eff4ff] hover:bg-[#e5eeff] rounded-xl border border-[#dce9ff] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">group</span>
                <span>Sinh Viên Phụ Trách</span>
              </button>
            </>
          )}

          {effectiveRole === 'Student' && (
            <>
              <button
                type="button"
                onClick={() => navigate('/admin/assessment-results')}
                className="px-3.5 py-2 text-[12px] font-semibold text-white bg-[#004ac6] hover:bg-[#003ea8] rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">insights</span>
                <span>Xem Kết Quả Chấm Điểm</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/my-profile')}
                className="px-3 py-2 text-[12px] font-semibold text-[#004ac6] bg-[#eff4ff] hover:bg-[#e5eeff] rounded-xl border border-[#dce9ff] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">person</span>
                <span>Hồ Sơ Cá Nhân</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#64748b]">
              {effectiveRole === 'Student' ? 'Đợt Thực Tập Hiện Tại' : 'Tổng Sinh Viên'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">school</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] font-bold text-[#0b1c30]">
              {effectiveRole === 'Student' ? (phase.name || 'Spring 2026') : students.length}
            </div>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">trending_up</span>
              {effectiveRole === 'Student' ? 'Đã đăng ký đợt' : 'Dữ liệu trực tiếp từ API'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#64748b]">
              {effectiveRole === 'Student' ? 'Giảng Viên Hướng Dẫn' : 'Giảng Viên Mentor'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">supervisor_account</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] font-bold text-[#0b1c30]">
              {effectiveRole === 'Student' ? 'TS. Nguyen Van A' : mentors.length}
            </div>
            <p className="text-[11px] text-[#64748b] mt-0.5 font-medium">
              {effectiveRole === 'Student' ? 'Mentor phụ trách' : 'Số lượng mentor khả dụng'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#64748b]">Đợt Kích Hoạt</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">timeline</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] font-bold text-[#0b1c30] truncate">{phase?.name || 'Chưa có đợt thực tập'}</div>
            <p className="text-[11px] text-[#64748b] mt-0.5 font-medium truncate">
              {phase?.startDate || '2026-01-01'} - {phase?.endDate || '2026-05-30'}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#64748b]">Tổng Phân Công</span>
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] text-[#004ac6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">assignment</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-[22px] font-bold text-[#0b1c30]">{totalAssignments}</div>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">
              {inProgressCount} đang thực hiện
            </p>
          </div>
        </div>
      </div>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Recent Assignments Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-[15px] font-bold text-[#0b1c30]">
                {effectiveRole === 'Student' ? 'Phân Công Thực Tập Cá Nhân' : 'Danh Sách Phân Công Mới Nhất'}
              </h3>
              <p className="text-[11.5px] text-[#64748b] mt-0.5">
                Cập nhật dữ liệu phân công thực tập từ hệ thống
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/assignments')}
              className="text-[12px] font-semibold text-[#004ac6] hover:underline cursor-pointer"
            >
              Xem tất cả →
            </button>
          </div>

          {recentAssignments.length === 0 ? (
            <div className="p-6 text-center bg-[#f8fafc] rounded-xl border border-dashed border-[#cbd5e1]">
              <span className="material-symbols-outlined text-[28px] text-[#94a3b8] mb-1">
                assignment_late
              </span>
              <p className="text-[12.5px] font-medium text-[#475569]">Chưa có phân công thực tập nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#f1f5f9] text-[11px] font-semibold text-[#64748b] uppercase">
                    <th className="pb-2.5 pr-3">Sinh Viên</th>
                    <th className="pb-2.5 px-3">Doanh Nghiệp / Đề Tài</th>
                    <th className="pb-2.5 px-3">Mentor</th>
                    <th className="pb-2.5 pl-3 text-right">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9] text-[12.5px]">
                  {recentAssignments.map((asg) => (
                    <tr
                      key={asg.id}
                      onClick={() => onSelectAssignment(asg)}
                      className="hover:bg-[#f8fafc] cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 pr-3 font-medium text-[#0b1c30]">{asg.studentName}</td>
                      <td className="py-2.5 px-3 text-[#434655]">{asg.companyName}</td>
                      <td className="py-2.5 px-3 text-[#434655]">{asg.mentorName}</td>
                      <td className="py-2.5 pl-3 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                            asg.status === 'IN PROGRESS'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : asg.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : asg.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {asg.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Status Breakdown & Assessment Rounds */}
        <div className="space-y-5">
          {/* Status Breakdown Bar */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs">
            <h3 className="text-[15px] font-bold text-[#0b1c30] mb-0.5">Tỷ Lệ Trạng Thái Phân Công</h3>
            <p className="text-[11.5px] text-[#64748b] mb-3">Phân bổ % thực tế từ danh sách phân công</p>

            <div className="h-2.5 w-full bg-[#f1f5f9] rounded-full overflow-hidden flex mb-3">
              <div style={{ width: `${inProgressPct}%` }} className="bg-[#2563eb] h-full" title={`In Progress: ${inProgressPct}%`} />
              <div style={{ width: `${pendingPct}%` }} className="bg-[#f59e0b] h-full" title={`Pending: ${pendingPct}%`} />
              <div style={{ width: `${completedPct}%` }} className="bg-[#10b981] h-full" title={`Completed: ${completedPct}%`} />
              <div style={{ width: `${cancelledPct}%` }} className="bg-[#ef4444] h-full" title={`Cancelled: ${cancelledPct}%`} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11.5px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
                <span className="text-[#64748b]">In Progress ({inProgressPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                <span className="text-[#64748b]">Pending ({pendingPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span className="text-[#64748b]">Completed ({completedPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                <span className="text-[#64748b]">Cancelled ({cancelledPct}%)</span>
              </div>
            </div>
          </div>

          {/* Assessment Rounds List */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-bold text-[#0b1c30]">Các Đợt Đánh Giá Chấm Điểm</h3>
              <button
                type="button"
                onClick={() => navigate('/admin/assessment-rounds')}
                className="text-[12px] font-semibold text-[#004ac6] hover:underline cursor-pointer"
              >
                Chi tiết →
              </button>
            </div>

            <div className="space-y-2.5">
              {rounds.length === 0 ? (
                <p className="text-[11.5px] text-[#94a3b8] italic">Chưa có đợt đánh giá nào</p>
              ) : (
                rounds.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[12.5px] font-semibold text-[#0b1c30]">{r.name}</div>
                      <div className="text-[10.5px] text-[#64748b]">Hạn nộp: {r.deadline}</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[9.5px] font-bold uppercase rounded-full ${
                        r.status === 'UPCOMING'
                          ? 'bg-amber-100 text-amber-800'
                          : r.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
