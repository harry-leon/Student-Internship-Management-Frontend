import React, { useEffect, useState } from 'react';
import { InternshipPhase, Assignment, AssessmentRound } from '../../types';
import { DashboardCompanyDistribution, DashboardMentorWorkload, dashboardService } from '../../api/dashboardService';
import { Button, Card, Badge, PageHeader } from '../ui';
import { uiConfig } from '../../config/ui.config';

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
  const [mentorWorkloads, setMentorWorkloads] = useState<DashboardMentorWorkload[]>([]);
  const [companyDistribution, setCompanyDistribution] = useState<DashboardCompanyDistribution[]>([]);

  const fetchStats = async () => {
    try {
      const res = await dashboardService.getMyDashboard();
      if (res && res.kpis) {
        setKpis(res.kpis);
      }
      setMentorWorkloads(Array.isArray(res?.details?.mentorWorkloads) ? res.details.mentorWorkloads : []);
      setCompanyDistribution(Array.isArray(res?.details?.companyDistribution) ? res.details.companyDistribution : []);
    } catch {
      // Ignore fallback
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const distributionColors = ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500'];
  const companyDistributionRows = companyDistribution.map((item, index) => ({
    ...item,
    color: distributionColors[index % distributionColors.length],
  }));
  const getWorkloadTag = (tag?: string) => {
    if (tag === 'Da day') return '\u0110\u00e3 \u0111\u1ea7y';
    if (tag === 'On dinh') return '\u1ed4n \u0111\u1ecbnh';
    return '\u0043\u00f2n ch\u1ed7';
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Admin Action Header */}
      <PageHeader
        title="Tổng Quan Hệ Thống Quản Lý Thực Tập"
        description={`Đợt: ${phase.name || 'Chưa thiết lập đợt'}${phase.term ? ` (${phase.term})` : ''} • Tổng hợp dữ liệu đợt thực tập, phân công hướng dẫn và kết quả đánh giá.`}
        badge={<Badge status="active">Operational Control</Badge>}
        actions={
          <>
            <Button
              variant="outline"
              icon="refresh"
              onClick={fetchStats}
            >
              Làm Mới
            </Button>
            <Button
              variant="outline"
              icon="tune"
              onClick={onOpenConfigurePhase}
            >
              Cấu Hình Phase
            </Button>
            <Button
              variant="outline"
              icon="download"
              onClick={onOpenExportReport}
            >
              Xuất Báo Cáo
            </Button>
            <Button
              variant="primary"
              icon="add"
              onClick={onOpenQuickAction}
            >
              Phân Công Mới
            </Button>
          </>
        }
      />

      {/* System Overview KPIs */}
      <div className={uiConfig.grid.stats}>
        <Card padding="compact">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng Sinh Viên</div>
          <div className="mt-1 text-[20px] font-bold text-slate-900 dark:text-white">{kpis.totalStudents ?? phase.totalStudents ?? 0}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-emerald-600 font-medium">
            <span>↑ 100%</span>
            <span className="text-slate-400">Đã đăng ký</span>
          </div>
        </Card>
        <Card padding="compact">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Giảng Viên Hướng Dẫn</div>
          <div className="mt-1 text-[20px] font-bold text-[#004ac6] dark:text-blue-400">{kpis.totalMentors ?? phase.totalMentors ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-slate-500">Giảng viên thuộc hệ thống</div>
        </Card>
        <Card padding="compact">
          <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Đơn Chờ Phê Duyệt</div>
          <div className="mt-1 text-[20px] font-bold text-amber-800 dark:text-amber-300">{kpis.pendingApplications ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-amber-600 font-medium">Cần xử lý phê duyệt</div>
        </Card>
        <Card padding="compact">
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Phân Công Thực Hiện</div>
          <div className="mt-1 text-[20px] font-bold text-emerald-800 dark:text-emerald-300">{kpis.totalAssignments ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-emerald-600 font-medium">Đang trong tiến trình</div>
        </Card>
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
              {mentorWorkloads.map((m) => (
                <div key={m.name} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 hover:border-slate-300 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 text-xs truncate">{m.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                        m.percent >= 100 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {getWorkloadTag(m.tag)}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">{m.department || 'General'}</div>
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
              {mentorWorkloads.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-[11px] text-slate-500">
                  Chưa có dữ liệu phân công mentor.
                </div>
              )}
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
              {companyDistributionRows.map((c) => (
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
              {companyDistributionRows.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-[11px] text-slate-500">
                  Chưa có dữ liệu phân bổ doanh nghiệp.
                </div>
              )}
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

