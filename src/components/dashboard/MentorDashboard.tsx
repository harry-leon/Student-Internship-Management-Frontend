import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../api/dashboardService';
import { weeklyReportService } from '../../api/weeklyReportService';
import { WeeklyReport } from '../../types';
import { Can } from '../Can';
import { PermissionCode } from '../../config/permissions.config';
import { Button, Card, Badge, PageHeader } from '../ui';

interface MentorDashboardProps {
  onRegisterRefetch?: (fn: () => void) => void;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({ onRegisterRefetch }) => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<Record<string, any>>({});
  const [pendingReports, setPendingReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, reportsRes] = await Promise.allSettled([
        dashboardService.getMentorDashboard(),
        weeklyReportService.getReports({ status: 'SUBMITTED' }),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.kpis) {
        setKpis(dashRes.value.kpis);
      } else if (dashRes.status === 'rejected') {
        setError('Không thể tải dữ liệu dashboard giảng viên.');
      }

      if (reportsRes.status === 'fulfilled') {
        const val = reportsRes.value;
        const list = Array.isArray(val) ? val : val?.content || [];
        setPendingReports(list.slice(0, 5));
      } else {
        setPendingReports([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Register refetch so DashboardView can trigger from outside
  useEffect(() => {
    onRegisterRefetch?.(fetchDashboardData);
  }, [fetchDashboardData, onRegisterRefetch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Mentor Header */}
      <PageHeader
        title="Bảng Quản Lý Hướng Dẫn Thực Tập"
        description="Theo dõi tiến độ, review báo cáo tuần và chấm điểm Rubric cho sinh viên được phân công."
        badge={<Badge status="active">Mentor Workspace</Badge>}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon="refresh"
              loading={loading}
              onClick={fetchDashboardData}
            >
              Làm Mới
            </Button>
            <Can permission={PermissionCode.GROUP_VIEW}>
              <Button
                variant="outline"
                size="sm"
                icon="groups"
                onClick={() => navigate('/groups')}
              >
                Nhóm Hướng Dẫn
              </Button>
            </Can>
            <Can permission={PermissionCode.SUBMISSION_VIEW}>
              <Button
                variant="outline"
                size="sm"
                icon="upload_file"
                onClick={() => navigate('/submissions')}
              >
                Bài Nộp Sinh Viên
              </Button>
            </Can>
            <Button
              variant="primary"
              size="sm"
              icon="assignment"
              onClick={() => navigate('/weekly-reports')}
            >
              Review Báo Cáo Tuần
            </Button>
            <Can permission={PermissionCode.ASSESSMENT_SCORE}>
              <Button
                variant="secondary"
                size="sm"
                icon="fact_check"
                onClick={() => navigate('/assessment-results')}
              >
                Chấm Điểm Rubric
              </Button>
            </Can>
          </>
        }
      />

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>Thử lại</Button>
        </div>
      )}

      {/* Mentor KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card padding="compact">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sinh Viên Phụ Trách</div>
          <div className="mt-1.5 text-[22px] font-bold text-slate-900 dark:text-slate-100">{kpis.activeStudents ?? 0} sinh viên</div>
          <div className="mt-0.5 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">Phân công trực tiếp</div>
        </Card>
        <Card padding="compact">
          <div className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Báo Cáo Chờ Duyệt</div>
          <div className="mt-1.5 text-[22px] font-bold text-blue-900 dark:text-blue-200">{kpis.reportsToReview ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-blue-700 dark:text-blue-400 font-medium">Trạng thái SUBMITTED</div>
        </Card>
        <Card padding="compact">
          <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Hàng Chờ Đánh Giá</div>
          <div className="mt-1.5 text-[22px] font-bold text-amber-900 dark:text-amber-200">{kpis.gradingQueue ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-amber-700 dark:text-amber-400 font-medium">Báo cáo & bài nộp</div>
        </Card>
        <Card padding="compact">
          <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Nhóm Quản Lý</div>
          <div className="mt-1.5 text-[22px] font-bold text-emerald-900 dark:text-emerald-200">{kpis.groups ?? 0} nhóm</div>
          <div className="mt-0.5 text-[10.5px] text-emerald-700 dark:text-emerald-400 font-medium">Đang hoạt động</div>
        </Card>
      </div>

      {/* Mentor Task Queue */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          <Card>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2.5">Danh Sách Báo Cáo Tuần Cần Review</h3>
            {loading ? (
              <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">Đang tải danh sách báo cáo...</div>
            ) : pendingReports.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                Không có báo cáo tuần nào đang chờ duyệt.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingReports.map((item) => (
                  <div key={item.reportId} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 text-[9.5px] font-bold text-blue-800 dark:text-blue-300">Tuần {item.weekNumber}</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{item.title}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Sinh viên: <strong>{item.studentName || 'Sinh viên'}</strong> ({item.studentCode || 'N/A'})
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/weekly-reports')}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <Card>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2.5">Hành Động Nhanh</h3>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => navigate('/weekly-reports')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>📝 Phê duyệt báo cáo tuần</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/assessment-results')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>✏️ Nhập điểm theo Rubric</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/groups')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>👥 Xem nhóm phụ trách</span>
                <span>→</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
