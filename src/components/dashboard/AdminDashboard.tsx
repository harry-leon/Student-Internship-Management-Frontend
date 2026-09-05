import React, { useEffect, useState } from 'react';
import { InternshipPhase, Assignment, AssessmentRound } from '../../types';
import { dashboardService } from '../../api/dashboardService';

interface AdminDashboardProps {
  phase: InternshipPhase;
  assignments: Assignment[];
  rounds: AssessmentRound[];
  onOpenConfigurePhase: () => void;
  onOpenExportReport: () => void;
  onOpenQuickAction: () => void;
  onSelectAssignment: (assignment: Assignment) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  phase,
  onOpenConfigurePhase,
  onOpenExportReport,
  onOpenQuickAction,
}) => {
  const [kpis, setKpis] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getMyDashboard();
        if (res && res.kpis) {
          setKpis(res.kpis);
        }
      } catch {
        // Ignore fallback
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Admin Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200 uppercase tracking-wider">
            Admin Operational Control
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30] mt-1.5">
            Tổng Quan Hệ Thống Quản Lý Thực Tập
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Đợt active: <strong className="text-slate-800">{phase.name || 'Spring 2026 Batch A'}</strong> ({phase.term})
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenConfigurePhase}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            ⚙️ Cấu Hình Phase
          </button>
          <button
            type="button"
            onClick={onOpenExportReport}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            📊 Xuất Báo Cáo
          </button>
          <button
            type="button"
            onClick={onOpenQuickAction}
            className="rounded-xl bg-[#004ac6] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#003eb3]"
          >
            + Phân Công Mới
          </button>
        </div>
      </div>

      {/* System Overview KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Sinh Viên</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.totalStudents ?? phase.totalStudents ?? 0}</div>
          <div className="mt-1 text-[11px] text-emerald-600">Đã đăng ký</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Giảng Viên Hướng Dẫn</div>
          <div className="mt-2 text-2xl font-bold text-[#004ac6]">{kpis.totalMentors ?? phase.totalMentors ?? 0}</div>
          <div className="mt-1 text-[11px] text-slate-500">Giảng viên hệ thống</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
          <div className="text-xs font-medium text-amber-800 uppercase tracking-wider">Đơn Đăng Ký Chờ Phê Duyệt</div>
          <div className="mt-2 text-2xl font-bold text-amber-900">{kpis.pendingApplications ?? 0}</div>
          <div className="mt-1 text-[11px] text-amber-700">Trạng thái SUBMITTED</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
          <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider">Phân Công Đang Thực Hiện</div>
          <div className="mt-2 text-2xl font-bold text-emerald-900">{kpis.totalAssignments ?? 0}</div>
          <div className="mt-1 text-[11px] text-emerald-700">Tổng số assignment</div>
        </div>
      </div>

      {/* Admin Quick Action Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Tải Trọng Giảng Viên Hướng Dẫn (Mentor Workload)</h3>
            <div className="space-y-3">
              {[
                { name: 'Dr. Le Thi B', dept: 'Software Engineering', current: 8, max: 10, percent: 80 },
                { name: 'Prof. Tran Van C', dept: 'Information Systems', current: 10, max: 10, percent: 100 },
                { name: 'MSc. Pham Hoang D', dept: 'Cyber Security', current: 6, max: 12, percent: 50 },
              ].map((m) => (
                <div key={m.name} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">{m.name}</div>
                    <div className="text-[11px] text-slate-500">{m.dept}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full ${m.percent >= 100 ? 'bg-rose-500' : 'bg-[#004ac6]'}`} style={{ width: `${m.percent}%` }}></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700">{m.current}/{m.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Thông Báo Cần Xử Lý</h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                ⚠️ 5 đơn đăng ký thực tập ngoài danh sách đang chờ duyệt.
              </div>
              <div className="p-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
                📝 8 bài chấm điểm Rubric Đợt 1 đã submit, chờ Admin công bố (Publish).
              </div>
              <div className="p-3 rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
                📌 Đợt thực tập Spring 2026 sẽ hoàn thành sau 4 tuần nữa.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
