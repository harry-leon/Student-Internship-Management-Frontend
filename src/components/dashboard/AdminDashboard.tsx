import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { InternshipPhase, Assignment, AssessmentRound } from '../../types';
import { DashboardCompanyDistribution, DashboardMentorWorkload, dashboardService } from '../../api/dashboardService';
import { Button, Card, Badge, PageHeader } from '../ui';

interface AdminDashboardProps {
  phase: InternshipPhase;
  assignments: Assignment[];
  rounds: AssessmentRound[];
  onOpenConfigurePhase: () => void;
  onOpenExportReport: () => void;
  onOpenQuickAction: () => void;
  onSelectAssignment: (assignment: Assignment) => void;
  onRegisterRefetch?: (fn: () => void) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  phase,
  onOpenConfigurePhase,
  onOpenExportReport,
  onOpenQuickAction,
  onRegisterRefetch,
}) => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<Record<string, any>>({});
  const [mentorWorkloads, setMentorWorkloads] = useState<DashboardMentorWorkload[]>([]);
  const [companyDistribution, setCompanyDistribution] = useState<DashboardCompanyDistribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<InternshipPhase | null>(phase);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = currentPhase?.phaseId 
        ? await dashboardService.getAdminDashboardByPhase(currentPhase.phaseId)
        : await dashboardService.getAdminDashboard();
      if (res && res.kpis) {
        setKpis(res.kpis);
      }
      setMentorWorkloads(Array.isArray(res?.details?.mentorWorkloads) ? res.details.mentorWorkloads : []);
      setCompanyDistribution(Array.isArray(res?.details?.companyDistribution) ? res.details.companyDistribution : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải số liệu dashboard admin.');
    } finally {
      setLoading(false);
    }
  }, [currentPhase?.phaseId]);

  // Register refetch so DashboardView can trigger from outside (visibility change, refreshKey)
  useEffect(() => {
    onRegisterRefetch?.(fetchStats);
  }, [fetchStats, onRegisterRefetch]);

  useEffect(() => {
    fetchStats();
    // 5-minute auto-refresh polling for admin KPIs
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const distributionColors = ['bg-blue-600', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500'];
  const companyDistributionRows = companyDistribution.map((item, index) => ({
    ...item,
    color: distributionColors[index % distributionColors.length],
  }));

  const getWorkloadTag = (tag?: string) => {
    if (tag === 'Da day') return 'Đã đầy';
    if (tag === 'On dinh') return 'Ổn định';
    return 'Còn chỗ';
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
              size="sm"
              icon="refresh"
              loading={loading}
              onClick={fetchStats}
            >
              Làm Mới
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="tune"
              onClick={onOpenConfigurePhase}
            >
              Cấu Hình Phase
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="download"
              onClick={onOpenExportReport}
            >
              Xuất Báo Cáo
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon="add"
              onClick={onOpenQuickAction}
            >
              Phân Công Mới
            </Button>
          </>
        }
      />

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchStats}>Thử lại</Button>
        </div>
      )}

      {/* System Overview KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card padding="compact" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/students')}>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng Sinh Viên</div>
          <div className="mt-1 text-[20px] font-bold text-slate-900 dark:text-slate-100">{kpis.totalStudents ?? 0}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Toàn hệ thống</span>
          </div>
        </Card>
        <Card padding="compact" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/mentors')}>
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giảng Viên</div>
          <div className="mt-1 text-[20px] font-bold text-[#004ac6] dark:text-blue-400">{kpis.totalMentors ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-slate-500 dark:text-slate-400">Mentor phụ trách</div>
        </Card>
        <Card padding="compact" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/companies')}>
          <div className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Doanh Nghiệp</div>
          <div className="mt-1 text-[20px] font-bold text-indigo-800 dark:text-indigo-300">{kpis.totalCompanies ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-indigo-600 dark:text-indigo-400 font-medium">Đối tác thực tập</div>
        </Card>
        <Card padding="compact" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/groups')}>
          <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">Nhóm Thực Tập</div>
          <div className="mt-1 text-[20px] font-bold text-purple-800 dark:text-purple-300">{kpis.totalGroups ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-purple-600 dark:text-purple-400 font-medium">Nhóm hoạt động</div>
        </Card>
        <Card padding="compact" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/internship-applications')}>
          <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Đơn Chờ Duyệt</div>
          <div className="mt-1 text-[20px] font-bold text-amber-800 dark:text-amber-300">{kpis.pendingApplications ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-amber-600 dark:text-amber-400 font-medium">Cần xử lý</div>
        </Card>
        <Card padding="compact" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/assignments')}>
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Phân Công</div>
          <div className="mt-1 text-[20px] font-bold text-emerald-800 dark:text-emerald-300">{kpis.totalAssignments ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">Đang triển khai</div>
        </Card>
      </div>

      {/* Admin Visual Analytics & Workloads */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        {/* Mentor Workload & Progress Widget */}
        <div className="lg:col-span-7 space-y-3">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Tải Trọng Giảng Viên Hướng Dẫn</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Số lượng sinh viên đang được phân công theo Giảng viên</p>
              </div>
              <span className="text-[11px] font-semibold text-[#004ac6] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                Active Batch
              </span>
            </div>
            <div className="space-y-2.5">
              {mentorWorkloads.map((m) => (
                <div key={m.name} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">{m.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                        m.percent >= 100 ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {getWorkloadTag(m.tag)}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">{m.department || 'General'}</div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${
                        m.percent >= 100 ? 'bg-rose-500' : m.percent >= 75 ? 'bg-amber-500' : 'bg-[#004ac6]'
                      }`} style={{ width: `${m.percent}%` }}></div>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 w-9 text-right">{m.current}/{m.max}</span>
                  </div>
                </div>
              ))}
              {mentorWorkloads.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
                  {loading ? 'Đang tải dữ liệu phân công...' : 'Chưa có dữ liệu phân công mentor.'}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* System Distribution Visualizer */}
        <div className="lg:col-span-5 space-y-3">
          <Card>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-0.5">Phân Bổ Sinh Viên Theo Doanh Nghiệp</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">Tỷ lệ sinh viên thực tập tại Top Công ty</p>
            
            {/* Visual Bar Chart breakdown */}
            <div className="space-y-2.5">
              {companyDistributionRows.map((c) => (
                <div key={c.company} className="space-y-0.5">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-slate-700 dark:text-slate-300">{c.company}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">{c.count} SV ({c.percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full ${c.color}`} style={{ width: `${c.percent}%` }}></div>
                  </div>
                </div>
              ))}
              {companyDistributionRows.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 p-3 text-center text-[11px] text-slate-500 dark:text-slate-400">
                  {loading ? 'Đang tải phân bổ doanh nghiệp...' : 'Chưa có dữ liệu phân bổ doanh nghiệp.'}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Dữ liệu thực tế hệ thống</span>
              <span className="font-semibold text-[#004ac6] dark:text-blue-400">Cập nhật tự động</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
