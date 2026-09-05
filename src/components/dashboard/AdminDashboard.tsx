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
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition-all">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Sinh Viên</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{kpis.totalStudents ?? phase.totalStudents ?? 0}</div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <span>↑ 100%</span>
            <span className="text-slate-400">Đã đăng ký hệ thống</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:shadow-md transition-all">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Giảng Viên Hướng Dẫn</div>
          <div className="mt-2 text-2xl font-bold text-[#004ac6]">{kpis.totalMentors ?? phase.totalMentors ?? 0}</div>
          <div className="mt-1 text-[11px] text-slate-500">Giảng viên thuộc hệ thống</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs hover:shadow-md transition-all">
          <div className="text-xs font-medium text-amber-800 uppercase tracking-wider">Đơn Chờ Phê Duyệt</div>
          <div className="mt-2 text-2xl font-bold text-amber-900">{kpis.pendingApplications ?? 0}</div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">Cần xử lý phê duyệt</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs hover:shadow-md transition-all">
          <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider">Phân Công Thực Hiện</div>
          <div className="mt-2 text-2xl font-bold text-emerald-900">{kpis.totalAssignments ?? 0}</div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">Đang trong tiến trình</div>
        </div>
      </div>

      {/* Admin Visual Analytics & Workloads */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Mentor Workload & Progress Widget */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tải Trọng Giảng Viên Hướng Dẫn</h3>
                <p className="text-xs text-slate-500">Số lượng sinh viên đang được phân công theo Giảng viên</p>
              </div>
              <span className="text-xs font-semibold text-[#004ac6] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                Active Batch
              </span>
            </div>
            <div className="space-y-3.5">
              {[
                { name: 'Dr. Le Thi B', dept: 'Software Engineering', current: 8, max: 10, percent: 80, tag: 'Ổn định' },
                { name: 'Prof. Tran Van C', dept: 'Information Systems', current: 10, max: 10, percent: 100, tag: 'Đã đầy' },
                { name: 'MSc. Pham Hoang D', dept: 'Cyber Security', current: 6, max: 12, percent: 50, tag: 'Còn chỗ' },
                { name: 'Dr. Nguyen Van E', dept: 'Artificial Intelligence', current: 4, max: 10, percent: 40, tag: 'Còn chỗ' },
              ].map((m) => (
                <div key={m.name} className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs truncate">{m.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.percent >= 100 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {m.tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{m.dept}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-28 bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className={`h-2 rounded-full transition-all duration-500 ${
                        m.percent >= 100 ? 'bg-rose-500' : m.percent >= 75 ? 'bg-amber-500' : 'bg-[#004ac6]'
                      }`} style={{ width: `${m.percent}%` }}></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 w-10 text-right">{m.current}/{m.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Distribution Visualizer */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Phân Bổ Sinh Viên Theo Doanh Nghiệp</h3>
            <p className="text-xs text-slate-500 mb-4">Tỷ lệ sinh viên thực tập tại Top Công ty</p>
            
            {/* Visual Bar Chart breakdown */}
            <div className="space-y-3">
              {[
                { company: 'FPT Software', count: 42, color: 'bg-blue-600', percent: 45 },
                { company: 'Viettel Telecom', count: 24, color: 'bg-emerald-500', percent: 26 },
                { company: 'VNG Corporation', count: 18, color: 'bg-amber-500', percent: 19 },
                { company: 'Doanh nghiệp khác', count: 10, color: 'bg-purple-500', percent: 10 },
              ].map((c) => (
                <div key={c.company} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{c.company}</span>
                    <span className="text-slate-500 font-mono">{c.count} SV ({c.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full ${c.color}`} style={{ width: `${c.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Cập nhật theo thời gian thực</span>
              <span className="font-semibold text-[#004ac6] cursor-pointer hover:underline">Chi tiết ➔</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

