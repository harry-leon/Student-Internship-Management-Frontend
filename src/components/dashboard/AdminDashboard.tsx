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
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Admin Action Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10.5px] font-bold text-blue-700 border border-blue-200 uppercase tracking-wider">
              Operational Control
            </span>
            <span className="text-xs text-slate-500">
              Đợt: <strong className="text-slate-800">{phase.name || 'Spring 2026 Batch A'}</strong> ({phase.term})
            </span>
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#0b1c30] mt-1">
            Tổng Quan Hệ Thống Quản Lý Thực Tập
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenConfigurePhase}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            ⚙️ Cấu Hình Phase
          </button>
          <button
            type="button"
            onClick={onOpenExportReport}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            📊 Xuất Báo Cáo
          </button>
          <button
            type="button"
            onClick={onOpenQuickAction}
            className="rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003eb3] transition-colors"
          >
            + Phân Công Mới
          </button>
        </div>
      </div>

      {/* System Overview KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng Sinh Viên</div>
          <div className="mt-1.5 text-[22px] font-bold text-slate-900">{kpis.totalStudents ?? phase.totalStudents ?? 0}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-emerald-600 font-medium">
            <span>↑ 100%</span>
            <span className="text-slate-400">Đã đăng ký hệ thống</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Giảng Viên Hướng Dẫn</div>
          <div className="mt-1.5 text-[22px] font-bold text-[#004ac6]">{kpis.totalMentors ?? phase.totalMentors ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-slate-500">Giảng viên thuộc hệ thống</div>
        </div>
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-3.5 shadow-2xs hover:border-amber-300 transition-all">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Đơn Chờ Phê Duyệt</div>
          <div className="mt-1.5 text-[22px] font-bold text-amber-900">{kpis.pendingApplications ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-amber-700 font-medium">Cần xử lý phê duyệt</div>
        </div>
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-3.5 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Phân Công Thực Hiện</div>
          <div className="mt-1.5 text-[22px] font-bold text-emerald-900">{kpis.totalAssignments ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-emerald-700 font-medium">Đang trong tiến trình</div>
        </div>
      </div>

      {/* Admin Visual Analytics & Workloads */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        {/* Mentor Workload & Progress Widget */}
        <div className="lg:col-span-7 space-y-3">
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tải Trọng Giảng Viên Hướng Dẫn</h3>
                <p className="text-[11px] text-slate-500">Số lượng sinh viên đang được phân công theo Giảng viên</p>
              </div>
              <span className="text-[11px] font-semibold text-[#004ac6] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                Active Batch
              </span>
            </div>
            <div className="space-y-2.5">
              {[
                { name: 'Dr. Le Thi B', dept: 'Software Engineering', current: 8, max: 10, percent: 80, tag: 'Ổn định' },
                { name: 'Prof. Tran Van C', dept: 'Information Systems', current: 10, max: 10, percent: 100, tag: 'Đã đầy' },
                { name: 'MSc. Pham Hoang D', dept: 'Cyber Security', current: 6, max: 12, percent: 50, tag: 'Còn chỗ' },
                { name: 'Dr. Nguyen Van E', dept: 'Artificial Intelligence', current: 4, max: 10, percent: 40, tag: 'Còn chỗ' },
              ].map((m) => (
                <div key={m.name} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 hover:border-slate-300 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 text-xs truncate">{m.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                        m.percent >= 100 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {m.tag}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">{m.dept}</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${
                        m.percent >= 100 ? 'bg-rose-500' : m.percent >= 75 ? 'bg-amber-500' : 'bg-[#004ac6]'
                      }`} style={{ width: `${m.percent}%` }}></div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-700 w-9 text-right">{m.current}/{m.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Distribution Visualizer */}
        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Phân Bổ Sinh Viên Theo Doanh Nghiệp</h3>
            <p className="text-[11px] text-slate-500 mb-3">Tỷ lệ sinh viên thực tập tại Top Công ty</p>
            
            {/* Visual Bar Chart breakdown */}
            <div className="space-y-2.5">
              {[
                { company: 'FPT Software', count: 42, color: 'bg-blue-600', percent: 45 },
                { company: 'Viettel Telecom', count: 24, color: 'bg-emerald-500', percent: 26 },
                { company: 'VNG Corporation', count: 18, color: 'bg-amber-500', percent: 19 },
                { company: 'Doanh nghiệp khác', count: 10, color: 'bg-purple-500', percent: 10 },
              ].map((c) => (
                <div key={c.company} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-slate-700">{c.company}</span>
                    <span className="text-slate-500 font-mono">{c.count} SV ({c.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full ${c.color}`} style={{ width: `${c.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Cập nhật theo thời gian thực</span>
              <span className="font-semibold text-[#004ac6] cursor-pointer hover:underline">Chi tiết ➔</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

