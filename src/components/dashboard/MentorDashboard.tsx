import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../api/dashboardService';

export const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();
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
      {/* Mentor Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200 uppercase tracking-wider">
              Mentor Workspace
            </span>
          </div>
          <h1 className="text-[20px] font-bold tracking-tight text-[#0b1c30] mt-1">
            Bảng Quản Lý Hướng Dẫn Thực Tập
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tiến độ, review báo cáo tuần và chấm điểm Rubric cho sinh viên.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/weekly-reports')}
            className="rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003eb3] transition-colors"
          >
            Review Báo Cáo Tuần
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/assessment-results')}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            Chấm Điểm Rubric
          </button>
        </div>
      </div>

      {/* Mentor KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-slate-300 transition-all">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Sinh Viên Phụ Trách</div>
          <div className="mt-1.5 text-[22px] font-bold text-slate-900">{kpis.activeStudents ?? 0} sinh viên</div>
          <div className="mt-0.5 text-[10.5px] text-emerald-600 font-medium">Được phân công trực tiếp</div>
        </div>
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/30 p-3.5 shadow-2xs hover:border-blue-300 transition-all">
          <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">Báo Cáo Chờ Duyệt</div>
          <div className="mt-1.5 text-[22px] font-bold text-blue-900">{kpis.reportsToReview ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-blue-700 font-medium">Trạng thái SUBMITTED</div>
        </div>
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-3.5 shadow-2xs hover:border-amber-300 transition-all">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Hàng Chờ Chấm Điểm</div>
          <div className="mt-1.5 text-[22px] font-bold text-amber-900">{kpis.gradingQueue ?? 0}</div>
          <div className="mt-0.5 text-[10.5px] text-amber-700 font-medium">Chấm điểm Rubric</div>
        </div>
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-3.5 shadow-2xs hover:border-emerald-300 transition-all">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Khu Vực Phụ Trách</div>
          <div className="mt-1.5 text-[22px] font-bold text-emerald-900">Hoạt Động</div>
          <div className="mt-0.5 text-[10.5px] text-emerald-700 font-medium">Đang hướng dẫn</div>
        </div>
      </div>

      {/* Mentor Task Queue */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">Danh Sách Báo Cáo Tuần Cần Review</h3>
            <div className="space-y-2">
              {[
                { name: 'Nguyen Van A', code: 'SE190001', week: 2, title: 'Báo cáo Tuần 2: Thiết kế DB & RESTful APIs', status: 'SUBMITTED' },
                { name: 'Tran Thi C', code: 'SE190002', week: 2, title: 'Báo cáo Tuần 2: Tích hợp Frontend React', status: 'NEEDS_REVISION' },
              ].map((item) => (
                <div key={item.code} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50/70 border border-slate-100">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9.5px] font-bold text-blue-800">Tuần {item.week}</span>
                      <span className="font-semibold text-slate-900 text-xs">{item.title}</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5">Sinh viên: <strong>{item.name}</strong> ({item.code})</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/weekly-reports')}
                    className="rounded-lg bg-[#004ac6] px-3 py-1 text-xs font-medium text-white hover:bg-[#003eb3] transition-colors"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-3">
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">Hành Động Nhanh</h3>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => navigate('/admin/weekly-reports')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-50/80 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center justify-between transition-colors"
              >
                <span>📝 Phê duyệt báo cáo tuần</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/assessment-results')}
                className="w-full text-left p-2.5 rounded-lg bg-slate-50/80 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center justify-between transition-colors"
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
