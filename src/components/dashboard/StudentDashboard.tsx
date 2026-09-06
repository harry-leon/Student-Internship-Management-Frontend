import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../api/dashboardService';
import { weeklyReportService } from '../../api/weeklyReportService';
import { WeeklyReport } from '../../types';
import { applicationService, InternshipApplication } from '../../api/applicationService';
import { useAuth } from '../../context/AuthContext';
import { Can } from '../Can';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [kpis, setKpis] = useState<Record<string, any>>({});
  const [myReports, setMyReports] = useState<WeeklyReport[]>([]);
  const [myApp, setMyApp] = useState<InternshipApplication | null>(null);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    Promise.allSettled([
      weeklyReportService.getReports(),
      applicationService.getApplications(),
    ]).then(([reportsRes, appsRes]) => {
      if (reportsRes.status === 'fulfilled') {
        const val = reportsRes.value;
        const list = Array.isArray(val) ? val : val?.content || [];
        setMyReports(list.slice(0, 5));
      }
      if (appsRes.status === 'fulfilled' && Array.isArray(appsRes.value) && appsRes.value.length > 0) {
        setMyApp(appsRes.value[0]);
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Student Welcome Banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#004ac6] to-indigo-800 p-4 sm:p-5 text-white shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="rounded bg-white/20 px-2 py-0.5 text-[10.5px] font-bold text-white uppercase tracking-wider">
            Cổng Thông Tin Thực Tập Sinh
          </span>
          <h1 className="text-[20px] font-bold tracking-tight text-white mt-1">
            Chào {user?.fullName || 'Sinh Viên'}!
          </h1>
          <p className="text-xs text-blue-100 mt-0.5">
            Hệ thống quản lý thực tập sinh viên
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Can permission="GROUP_VIEW">
            <button
              type="button"
              onClick={() => navigate('/groups')}
              className="rounded-lg bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
            >
              Nhóm Của Tôi
            </button>
          </Can>
          <Can permission="GROUP_TASK_VIEW">
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="rounded-lg bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
            >
              Nhiệm Vụ
            </button>
          </Can>
          <Can permission="SUBMISSION_VIEW">
            <button
              type="button"
              onClick={() => navigate('/submissions')}
              className="rounded-lg bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
            >
              Bài Nộp
            </button>
          </Can>
          <button
            type="button"
            onClick={() => navigate('/weekly-reports')}
            className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-[#004ac6] shadow-2xs hover:bg-blue-50 transition-colors cursor-pointer"
          >
            + Nộp Báo Cáo
          </button>
        </div>
      </div>

      {/* Student Status KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng Thái Thực Tập</div>
          <div className="mt-1.5 text-base font-bold text-emerald-600 dark:text-emerald-400">Đang Thực Tập</div>
          <div className="mt-0.5 text-[10.5px] text-slate-500 dark:text-slate-400">Cổng sinh viên</div>
        </div>
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Báo Cáo Đã Nộp</div>
          <div className="mt-1.5 text-[22px] font-bold text-[#004ac6] dark:text-blue-400">{kpis.myReportsCount ?? myReports.length} báo cáo</div>
          <div className="mt-0.5 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">Lịch trình cá nhân</div>
        </div>
        <div className="rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/30 p-3.5 shadow-2xs hover:border-amber-300 dark:hover:border-amber-700 transition-all">
          <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Hạn Nộp Báo Cáo</div>
          <div className="mt-1.5 text-base font-bold text-amber-900 dark:text-amber-200">17:00 Chủ Nhật</div>
          <div className="mt-0.5 text-[10.5px] text-amber-700 dark:text-amber-400 font-medium">Định kỳ hàng tuần</div>
        </div>
        <div className="rounded-xl border border-purple-200/80 dark:border-purple-800/60 bg-purple-50/30 dark:bg-purple-950/30 p-3.5 shadow-2xs hover:border-purple-300 dark:hover:border-purple-700 transition-all">
          <div className="text-[11px] font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">Bài Đánh Giá Rubric</div>
          <div className="mt-1.5 text-[22px] font-bold text-purple-900 dark:text-purple-200">{kpis.mySubmissionsCount ?? 0} bài</div>
          <div className="mt-0.5 text-[10.5px] text-purple-700 dark:text-purple-400 font-medium">Đã công bố</div>
        </div>
      </div>

      {/* Progress Timeline & Mentor Remarks */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
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
          </div>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2.5">Thông Tin Doanh Nghiệp</h3>
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
          </div>
        </div>
      </div>
    </div>
  );
};
