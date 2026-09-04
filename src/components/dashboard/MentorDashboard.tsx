import React from 'react';
import { useNavigate } from 'react-router-dom';

export const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Mentor Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            Mentor Workspace
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30] mt-1.5">
            Bảng Quản Lý Hướng Dẫn Thực Tập
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Chào mừng trở lại! Dưới đây là danh sách công việc cần theo dõi và phê duyệt.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/weekly-reports')}
            className="rounded-xl bg-[#004ac6] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003eb3]"
          >
            Review Báo Cáo Tuần
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/assessment-results')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            Chấm Điểm Rubric
          </button>
        </div>
      </div>

      {/* Mentor KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sinh Viên Phụ Trách</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">8 / 10</div>
          <div className="mt-1 text-[11px] text-emerald-600">80% chỉ tiêu</div>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
          <div className="text-xs font-medium text-blue-800 uppercase tracking-wider">Báo Cáo Chờ Duyệt</div>
          <div className="mt-2 text-2xl font-bold text-blue-900">3</div>
          <div className="mt-1 text-[11px] text-blue-700">Tuần 2 & Tuần 3</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
          <div className="text-xs font-medium text-amber-800 uppercase tracking-wider">Cần Chấm Điểm Rubric</div>
          <div className="mt-2 text-2xl font-bold text-amber-900">2</div>
          <div className="mt-1 text-[11px] text-amber-700">Đợt đánh giá 1</div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
          <div className="text-xs font-medium text-rose-800 uppercase tracking-wider">Sinh Viên Cảnh Báo Trễ</div>
          <div className="mt-2 text-2xl font-bold text-rose-900">1</div>
          <div className="mt-1 text-[11px] text-rose-700">Chưa nộp báo cáo Tuần 2</div>
        </div>
      </div>

      {/* Mentor Task Queue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Danh Sách Báo Cáo Tuần Cần Review</h3>
            <div className="space-y-3">
              {[
                { name: 'Nguyen Van A', code: 'SE190001', week: 2, title: 'Báo cáo Tuần 2: Thiết kế DB & RESTful APIs', status: 'SUBMITTED' },
                { name: 'Tran Thi C', code: 'SE190002', week: 2, title: 'Báo cáo Tuần 2: Tích hợp Frontend React', status: 'NEEDS_REVISION' },
              ].map((item) => (
                <div key={item.code} className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">Tuần {item.week}</span>
                      <span className="font-semibold text-slate-900 text-xs">{item.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">Sinh viên: <strong>{item.name}</strong> ({item.code})</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/weekly-reports')}
                    className="rounded-lg bg-[#004ac6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#003eb3]"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Hành Động Nhanh</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate('/admin/weekly-reports')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center justify-between"
              >
                <span>📝 Phê duyệt báo cáo tuần</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/assessment-results')}
                className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center justify-between"
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
