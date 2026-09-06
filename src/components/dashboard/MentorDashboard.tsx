import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../api/dashboardService';
import { weeklyReportService } from '../../api/weeklyReportService';
import { WeeklyReport } from '../../types';
import { Can } from '../Can';

export const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<Record<string, any>>({});
  const [pendingReports, setPendingReports] = useState<WeeklyReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

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

    setLoadingReports(true);
    weeklyReportService.getReports({ status: 'SUBMITTED' })
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.content || [];
        setPendingReports(list.slice(0, 5));
      })
      .catch(() => setPendingReports([]))
      .finally(() => setLoadingReports(false));
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Mentor Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
              Mentor Workspace
            </span>
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#0b1c30] dark:text-slate-100 mt-1">
            Bảng Quản Lý Hướng Dẫn Thực Tập
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Theo dõi tiến độ, review báo cáo tuần và chấm điểm Rubric cho sinh viên.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Can permission="GROUP_VIEW">
            <button
              type="button"
              onClick={() => navigate('/groups')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Nhóm Hướng Dẫn
            </button>
          </Can>
          <Can permission="SUBMISSION_VIEW">
            <button
              type="button"
              onClick={() => navigate('/submissions')}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Bài Nộp Sinh Viên
            </button>
          </Can>
          <button
            type="button"
            onClick={() => navigate('/weekly-reports')}
            className="rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003eb3] transition-colors cursor-pointer"
          >
            Review Báo Cáo Tuần
          </button>
          <Can permission="ASSESSMENT_SCORE">
            <button
              type="button"
              onClick={() => navigate('/assessment-results')}
              className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 shadow-2xs hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors cursor-pointer"
            >
              Chấm Điểm Rubric
            </button>
          </Can>
        </div>
      </div>

      {/* Mentor KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sinh Viên Phụ Trách</div>
          <div className="mt-1.5 text-[22px] font-bold text-slate-900 dark:text-slate-100">{kpis.activeStudents ?? 0} sinh viên</div>
          <div className="mt-0.5 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">Được phân công trực tiếp</div>
        </div>
        <div className="rounded-xl border border-blue-200/80 dark:border-blue-800/60 bg-blue-50/30 dark:bg-blue-950/30 p-3.5 shadow-2xs hover:border-blue-300 dark:hover:border-blue-700 transition-all">
          <div className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider">Báo Cáo Chờ Duyệt</div>
          <div className="mt-1.5 text-[22px] font-bold text-blue-900 dark:text-blue-200">{kpis.reportsToReview ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-blue-700 dark:text-blue-400 font-medium">Trạng thái SUBMITTED</div>
        </div>
        <div className="rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/30 p-3.5 shadow-2xs hover:border-amber-300 dark:hover:border-amber-700 transition-all">
          <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Hàng Chờ Chấm Điểm</div>
          <div className="mt-1.5 text-[22px] font-bold text-amber-900 dark:text-amber-200">{kpis.gradingQueue ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-amber-700 dark:text-amber-400 font-medium">Chấm điểm Rubric</div>
        </div>
        <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/30 p-3.5 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all">
          <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Khu Vực Phụ Trách</div>
          <div className="mt-1.5 text-[22px] font-bold text-emerald-900 dark:text-emerald-200">Hoạt Động</div>
          <div className="mt-0.5 text-[10.5px] text-emerald-700 dark:text-emerald-400 font-medium">Đang hướng dẫn</div>
        </div>
      </div>

      {/* Mentor Task Queue */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2.5">Danh Sách Báo Cáo Tuần Cần Review</h3>
            {loadingReports ? (
              <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">Đang tải danh sách...</div>
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
                        <span className="rounded bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.2 text-[9.5px] font-bold text-blue-800 dark:text-blue-300">Tuần {item.weekNumber}</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">{item.title}</span>
                      </div>
                      <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">Sinh viên: <strong>{item.studentName || 'Sinh viên'}</strong> ({item.studentCode || 'N/A'})</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/weekly-reports')}
                      className="rounded-lg bg-[#004ac6] px-3 py-1 text-xs font-medium text-white hover:bg-[#003eb3] transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xs">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
