import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../api/dashboardService';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
        <div>
          <button
            type="button"
            onClick={() => navigate('/weekly-reports')}
            className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-[#004ac6] shadow-2xs hover:bg-blue-50 transition-colors cursor-pointer"
          >
            + Nộp Báo Cáo Tuần
          </button>
        </div>
      </div>

      {/* Student Status KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Trạng Thái Thực Tập</div>
          <div className="mt-1.5 text-base font-bold text-emerald-600">Đang Thực Tập</div>
          <div className="mt-0.5 text-[10.5px] text-slate-500">Cổng sinh viên</div>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Báo Cáo Đã Nộp</div>
          <div className="mt-1.5 text-[22px] font-bold text-[#004ac6]">{kpis.myReportsCount ?? 0} báo cáo</div>
          <div className="mt-0.5 text-[10.5px] text-emerald-600 font-medium">Lịch trình cá nhân</div>
        </div>
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-3.5 shadow-2xs hover:border-amber-300 transition-all">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Hạn Nộp Báo Cáo</div>
          <div className="mt-1.5 text-base font-bold text-amber-900">17:00 Chủ Nhật</div>
          <div className="mt-0.5 text-[10.5px] text-amber-700 font-medium">Định kỳ hàng tuần</div>
        </div>
        <div className="rounded-xl border border-purple-200/80 bg-purple-50/30 p-3.5 shadow-2xs hover:border-purple-300 transition-all">
          <div className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider">Bài Đánh Giá Rubric</div>
          <div className="mt-1.5 text-[22px] font-bold text-purple-900">{kpis.mySubmissionsCount ?? 0} bài</div>
          <div className="mt-0.5 text-[10.5px] text-purple-700 font-medium">Đã công bố</div>
        </div>
      </div>

      {/* Progress Timeline & Mentor Remarks */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">Lịch Trình Báo Cáo Hàng Tuần</h3>
            <div className="space-y-2">
              {[
                { week: 1, title: 'Báo cáo Tuần 1: Khảo sát dự án & Setup', status: 'REVIEWED', comment: 'Đã duyệt. Khởi đầu tốt.' },
                { week: 2, title: 'Báo cáo Tuần 2: Thiết kế DB & RESTful APIs', status: 'REVIEWED', comment: 'Đã duyệt.' },
                { week: 3, title: 'Báo cáo Tuần 3: Weekly Progress Report Module', status: 'DRAFT', comment: 'Đang soạn thảo...' },
              ].map((w) => (
                <div key={w.week} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50/70 border border-slate-100 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 text-xs">Tuần {w.week}: {w.title}</div>
                    <div className="text-slate-500 text-[10.5px] mt-0.5">{w.comment}</div>
                  </div>
                  <div>
                    {w.status === 'REVIEWED' ? (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">✓ Đã duyệt</span>
                    ) : (
                      <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700">📝 Bản nháp</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">Thông Tin Doanh Nghiệp</h3>
            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium">Doanh nghiệp</span>
                <strong className="text-slate-900">FPT Software</strong>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium">Vị trí</span>
                <span className="text-slate-800 font-medium">Fullstack Java/React Intern</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium">Mentor doanh nghiệp</span>
                <span className="text-slate-800 font-medium">Anh Trần Minh Hoàng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
