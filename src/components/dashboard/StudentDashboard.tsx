import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../api/dashboardService';
import { weeklyReportService } from '../../api/weeklyReportService';
import { WeeklyReport } from '../../types';
import { applicationService, InternshipApplication } from '../../api/applicationService';
import { useAuth } from '../../context/AuthContext';
import { Can } from '../Can';
import { PermissionCode } from '../../config/permissions.config';
import { Button, Card, Badge, PageHeader } from '../ui';

interface StudentDashboardProps {
  onRegisterRefetch?: (fn: () => void) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onRegisterRefetch }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [kpis, setKpis] = useState<Record<string, any>>({});
  const [myReports, setMyReports] = useState<WeeklyReport[]>([]);
  const [myApp, setMyApp] = useState<InternshipApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, reportsRes, appsRes] = await Promise.allSettled([
        dashboardService.getStudentDashboard(),
        weeklyReportService.getReports(),
        applicationService.getApplications(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.kpis) {
        setKpis(dashRes.value.kpis);
      } else if (dashRes.status === 'rejected') {
        setError('Không thể tải dữ liệu cổng thông tin sinh viên.');
      }

      if (reportsRes.status === 'fulfilled') {
        const val = reportsRes.value;
        const list = Array.isArray(val) ? val : val?.content || [];
        setMyReports(list.slice(0, 5));
      }

      if (appsRes.status === 'fulfilled' && Array.isArray(appsRes.value) && appsRes.value.length > 0) {
        setMyApp(appsRes.value[0]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Register refetch so DashboardView can trigger from outside
  useEffect(() => {
    onRegisterRefetch?.(fetchStudentData);
  }, [fetchStudentData, onRegisterRefetch]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Student Welcome Banner */}
      <PageHeader
        title={`Chào ${user?.fullName || 'Sinh Viên'}!`}
        description="Cổng thông tin theo dõi tiến trình thực tập, phân công nhiệm vụ và lịch trình nộp báo cáo."
        badge={<Badge status="active">Student Workspace</Badge>}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon="refresh"
              loading={loading}
              onClick={fetchStudentData}
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
                Nhóm Của Tôi
              </Button>
            </Can>
            <Can permission={PermissionCode.GROUP_TASK_VIEW}>
              <Button
                variant="outline"
                size="sm"
                icon="task_alt"
                onClick={() => navigate('/tasks')}
              >
                Nhiệm Vụ
              </Button>
            </Can>
            <Can permission={PermissionCode.SUBMISSION_VIEW}>
              <Button
                variant="outline"
                size="sm"
                icon="upload_file"
                onClick={() => navigate('/submissions')}
              >
                Bài Nộp
              </Button>
            </Can>
            <Button
              variant="primary"
              size="sm"
              icon="add"
              onClick={() => navigate('/weekly-reports')}
            >
              Nộp Báo Cáo
            </Button>
          </>
        }
      />

      {error && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchStudentData}>Thử lại</Button>
        </div>
      )}

      {/* Student Status KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card padding="compact">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng Thái Thực Tập</div>
          <div className="mt-1.5 text-base font-bold text-emerald-600 dark:text-emerald-400">Đang Thực Tập</div>
          <div className="mt-0.5 text-[10.5px] text-slate-500 dark:text-slate-400">Cổng sinh viên</div>
        </Card>
        <Card padding="compact">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Báo Cáo Đã Nộp</div>
          <div className="mt-1.5 text-[22px] font-bold text-[#004ac6] dark:text-blue-400">{kpis.myReportsCount ?? myReports.length} báo cáo</div>
          <div className="mt-0.5 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">Lịch trình cá nhân</div>
        </Card>
        <Card padding="compact">
          <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Nhiệm Vụ Được Giao</div>
          <div className="mt-1.5 text-[22px] font-bold text-amber-900 dark:text-amber-200">{kpis.assignedTasks ?? 0} nhiệm vụ</div>
          <div className="mt-0.5 text-[10.5px] text-amber-700 dark:text-amber-400 font-medium">Được phân công</div>
        </Card>
        <Card padding="compact">
          <div className="text-[11px] font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">Bài Nộp Đánh Giá</div>
          <div className="mt-1.5 text-[22px] font-bold text-purple-900 dark:text-purple-200">{kpis.mySubmissionsCount ?? 0} bài</div>
          <div className="mt-0.5 text-[10.5px] text-purple-700 dark:text-purple-400 font-medium">Đã ghi nhận</div>
        </Card>
      </div>

      {/* Progress Timeline & Mentor Remarks */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          <Card>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2.5">Lịch Trình Báo Cáo Hàng Tuần</h3>
            {loading ? (
              <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">Đang tải lịch trình...</div>
            ) : myReports.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                Bạn chưa nộp báo cáo tuần nào. Nhấn "+ Nộp Báo Cáo" để bắt đầu nộp báo cáo tiến độ tuần này.
              </div>
            ) : (
              <div className="space-y-2">
                {myReports.map((w) => (
                  <div key={w.reportId} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">Tuần {w.weekNumber}: {w.title}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-[10.5px] mt-0.5">{w.feedback || 'Chưa có nhận xét.'}</div>
                    </div>
                    <div>
                      {w.status === 'REVIEWED' ? (
                        <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">✓ Đã duyệt</span>
                      ) : w.status === 'SUBMITTED' ? (
                        <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">⏳ Chờ duyệt</span>
                      ) : (
                        <span className="rounded-md bg-slate-200/80 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">📝 Bản nháp</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <Card>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2.5">Thông Tin Đơn Thực Tập</h3>
            <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Doanh nghiệp</span>
                <strong className="text-slate-900 dark:text-slate-100">{myApp?.companyName || myApp?.proposedCompanyName || 'Chưa phân công'}</strong>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Vị trí</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{myApp?.positionTitle || 'Chưa phân công'}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Mentor doanh nghiệp</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{myApp?.companyMentorName || 'Chưa phân công'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
