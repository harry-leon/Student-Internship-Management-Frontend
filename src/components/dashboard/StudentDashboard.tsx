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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Student Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#004ac6] to-indigo-800 p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
            Cổng Thông Tin Thực Tập Sinh
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
            Chào {user?.fullName || 'Sinh Viên'}!
          </h1>
          <p className="text-xs text-blue-100 mt-1">
            Hệ thống quản lý thực tập sinh viên
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => navigate('/admin/weekly-reports')}
            className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#004ac6] shadow-sm hover:bg-blue-50 transition-colors"
          >
            + Nộp Báo Cáo Tuần
          </button>
        </div>
      </div>

      {/* Student Status KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Trạng Thái Thực Tập</div>
          <div className="mt-2 text-lg font-bold text-emerald-600">Đang Thực Tập</div>
          <div className="mt-1 text-[11px] text-slate-500">Cổng sinh viên</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Báo Cáo Đã Nộp</div>
          <div className="mt-2 text-2xl font-bold text-[#004ac6]">{kpis.myReportsCount ?? 0} báo cáo</div>
          <div className="mt-1 text-[11px] text-emerald-600">Lịch trình cá nhân</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs">
          <div className="text-xs font-medium text-amber-800 uppercase tracking-wider">Hạn Nộp Tiếp Theo</div>
          <div className="mt-2 text-lg font-bold text-amber-900">17:00 Chủ Nhật</div>
          <div className="mt-1 text-[11px] text-amber-700">Định kỳ hàng tuần</div>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50/40 p-4 shadow-xs">
          <div className="text-xs font-medium text-purple-800 uppercase tracking-wider">Bài Đánh Giá Rubric</div>
          <div className="mt-2 text-2xl font-bold text-purple-900">{kpis.mySubmissionsCount ?? 0} bài</div>
          <div className="mt-1 text-[11px] text-purple-700">Đã công bố</div>
        </div>
      </div>

      {/* Progress Timeline & Mentor Remarks */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Lịch Trình Báo Cáo Hàng Tuần</h3>
            <div className="space-y-3">
              {[
                { week: 1, title: 'Báo cáo Tuần 1: Khảo sát dự án & Setup', status: 'REVIEWED', comment: 'Đã duyệt. Khởi đầu tốt.' },
                { week: 2, title: 'Báo cáo Tuần 2: Thiết kế DB & RESTful APIs', status: 'REVIEWED', comment: 'Đã duyệt.' },
                { week: 3, title: 'Báo cáo Tuần 3: Weekly Progress Report Module', status: 'DRAFT', comment: 'Đang soạn thảo...' },
              ].map((w) => (
                <div key={w.week} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">Tuần {w.week}: {w.title}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{w.comment}</div>
                  </div>
                  <div>
                    {w.status === 'REVIEWED' ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">✓ Đã duyệt</span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700">📝 Bản nháp</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Thông Tin Doanh Nghiệp</h3>
            <div className="text-xs space-y-2 text-slate-600">
              <div><strong>Công ty:</strong> FPT Software</div>
              <div><strong>Vị trí:</strong> Fullstack Java/React Intern</div>
              <div><strong>Mentor Doanh Nghiệp:</strong> Anh Trần Minh Hoàng</div>
              <div><strong>Email liên hệ:</strong> hoangtm@fpt.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
