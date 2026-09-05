import React, { useState, useEffect } from 'react';
import { Role, WeeklyReport, WeeklyReportStatus } from '../types';
import { weeklyReportService } from '../api/weeklyReportService';

interface WeeklyReportsViewProps {
  currentRole: Role;
}



export const WeeklyReportsView: React.FC<WeeklyReportsViewProps> = ({ currentRole }) => {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [draftSavedMessage, setDraftSavedMessage] = useState(false);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [mentorComment, setMentorComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState<WeeklyReportStatus>('REVIEWED');

  // Form State for Student Create/Update
  const [formData, setFormData] = useState({
    assignmentId: 101,
    weekNumber: 1,
    reportTitle: '',
    completedTasks: '',
    difficulties: '',
    nextPlan: '',
    workingHours: 40,
    attachmentUrl: '',
  });

  // Restore draft from localStorage on load
  useEffect(() => {
    const savedDraft = localStorage.getItem('weekly_report_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    }
  }, []);

  // Auto save draft on form change
  const handleFormChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    localStorage.setItem('weekly_report_draft', JSON.stringify(updated));
    setDraftSavedMessage(true);
    setTimeout(() => setDraftSavedMessage(false), 2000);
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await weeklyReportService.getReports();
      if (Array.isArray(res)) {
        setReports(res);
      } else if (res && Array.isArray(res.content)) {
        setReports(res.content);
      } else {
        setReports([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách báo cáo tuần.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRep = await weeklyReportService.createReport(formData);
      setReports((prev) => [newRep, ...prev]);
      setIsCreateOpen(false);
      setFormData({
        assignmentId: 101,
        weekNumber: 1,
        reportTitle: '',
        completedTasks: '',
        difficulties: '',
        nextPlan: '',
        workingHours: 40,
        attachmentUrl: '',
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Tạo báo cáo thất bại');
    }
  };

  const handleSubmitReport = async (reportId: number) => {
    try {
      const updated = await weeklyReportService.submitReport(reportId);
      setReports((prev) => prev.map((r) => (r.reportId === reportId ? updated : r)));
      if (selectedReport?.reportId === reportId) {
        setSelectedReport(updated);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Nộp báo cáo thất bại');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      const updated = await weeklyReportService.reviewReport(selectedReport.reportId, {
        mentorComment,
        status: reviewStatus,
      });
      setReports((prev) => prev.map((r) => (r.reportId === selectedReport.reportId ? updated : r)));
      setIsReviewOpen(false);
      setSelectedReport(updated);
      setMentorComment('');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Đánh giá báo cáo thất bại');
    }
  };

  const getStatusBadge = (status: WeeklyReportStatus) => {
    switch (status) {
      case 'REVIEWED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">✓ Đã Duyệt</span>;
      case 'SUBMITTED':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-600/20">⏳ Chờ Duyệt</span>;
      case 'NEEDS_REVISION':
        return <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20">⚠️ Cần Sửa</span>;
      case 'DRAFT':
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-400/20">📝 Nháp</span>;
      case 'LATE':
        return <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-600/20">🚨 Trễ Hạn</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0b1c30]">Quản Lý Báo Cáo Tuần</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi tiến độ thực tập hàng tuần, nhận xét & phê duyệt báo cáo sinh viên</p>
        </div>
        {currentRole === 'Student' && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#004ac6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#003eb3] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Tạo Báo Cáo Tuần</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tổng Số Báo Cáo</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{reports.length}</div>
        </div>
        <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 shadow-xs">
          <div className="text-xs font-medium text-blue-700 uppercase tracking-wider">Chờ Duyệt</div>
          <div className="mt-2 text-2xl font-bold text-blue-800">{reports.filter(r => r.status === 'SUBMITTED').length}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-xs">
          <div className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Đã Duyệt</div>
          <div className="mt-2 text-2xl font-bold text-emerald-800">{reports.filter(r => r.status === 'REVIEWED').length}</div>
        </div>
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-xs">
          <div className="text-xs font-medium text-amber-700 uppercase tracking-wider">Cần Chỉnh Sửa</div>
          <div className="mt-2 text-2xl font-bold text-amber-800">{reports.filter(r => r.status === 'NEEDS_REVISION').length}</div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'SUBMITTED', 'REVIEWED', 'NEEDS_REVISION', 'DRAFT'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedStatus === st
                  ? 'bg-[#004ac6] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              viewMode === 'table' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            📋 Bảng
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
              viewMode === 'timeline' ? 'bg-white text-[#004ac6] shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ⏳ Timeline
          </button>
        </div>
      </div>

      {/* Main Content Layout (List & Preview) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Reports List */}
        <div className={`${selectedReport ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Đang tải báo cáo...</div>
          ) : filteredReports.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Không tìm thấy báo cáo tuần nào</div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.reportId}
                onClick={() => setSelectedReport(report)}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all ${
                  selectedReport?.reportId === report.reportId
                    ? 'border-[#004ac6] bg-blue-50/30 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">Tuần {report.weekNumber}</span>
                      <h3 className="font-semibold text-slate-900 text-base">{report.reportTitle || `Báo cáo Tuần ${report.weekNumber}`}</h3>
                    </div>
                    <p className="text-xs text-slate-500">Sinh viên: <span className="font-medium text-slate-700">{report.studentName || report.studentCode}</span> | Mentor: <span className="font-medium text-slate-700">{report.mentorName || 'Chưa phân công'}</span></p>
                  </div>
                  <div>{getStatusBadge(report.status)}</div>
                </div>

                <div className="mt-3 line-clamp-2 text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-2.5">
                  <strong>Công việc đã hoàn thành:</strong> {report.completedTasks}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-2.5">
                  <span>Giờ làm: <strong>{report.workingHours || 0}h</strong></span>
                  <span>{report.submittedAt ? `Nộp ngày: ${new Date(report.submittedAt).toLocaleDateString('vi-VN')}` : 'Chưa nộp'}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Report Detail Panel */}
        {selectedReport && (
          <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">Tuần {selectedReport.weekNumber}</span>
                <h2 className="text-lg font-bold text-slate-900 mt-2">{selectedReport.reportTitle}</h2>
                <p className="text-xs text-slate-500 mt-1">Đợt: {selectedReport.phaseName || 'Spring 2026'}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-900 uppercase tracking-wider mb-1 text-[11px] text-slate-400">Công việc đã hoàn thành</h4>
                <div className="rounded-xl bg-slate-50 p-3 text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100">
                  {selectedReport.completedTasks}
                </div>
              </div>

              {selectedReport.difficulties && (
                <div>
                  <h4 className="font-semibold text-amber-800 uppercase tracking-wider mb-1 text-[11px]">Khó khăn & vướng mắc</h4>
                  <div className="rounded-xl bg-amber-50/60 p-3 text-amber-900 whitespace-pre-wrap leading-relaxed border border-amber-100">
                    {selectedReport.difficulties}
                  </div>
                </div>
              )}

              {selectedReport.nextPlan && (
                <div>
                  <h4 className="font-semibold text-slate-900 uppercase tracking-wider mb-1 text-[11px] text-slate-400">Kế hoạch tuần tiếp theo</h4>
                  <div className="rounded-xl bg-slate-50 p-3 text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100">
                    {selectedReport.nextPlan}
                  </div>
                </div>
              )}

              {selectedReport.mentorComment && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs mb-1">
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    <span>Nhận xét từ Mentor ({selectedReport.reviewedByName || 'Giảng viên'})</span>
                  </div>
                  <p className="text-blue-800 text-xs leading-relaxed">{selectedReport.mentorComment}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              {currentRole === 'Student' && (selectedReport.status === 'DRAFT' || selectedReport.status === 'NEEDS_REVISION') && (
                <button
                  type="button"
                  onClick={() => handleSubmitReport(selectedReport.reportId)}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Nộp Báo Cáo
                </button>
              )}

              {(currentRole === 'Mentor' || currentRole === 'Admin') && selectedReport.status === 'SUBMITTED' && (
                <button
                  type="button"
                  onClick={() => {
                    setMentorComment(selectedReport.mentorComment || '');
                    setIsReviewOpen(true);
                  }}
                  className="rounded-xl bg-[#004ac6] px-4 py-2 text-xs font-semibold text-white hover:bg-[#003eb3] shadow-xs"
                >
                  Nhận Xét & Duyệt Báo Cáo
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Tạo Báo Cáo Tuần Mới</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Số Tuần</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.weekNumber}
                  onChange={(e) => setFormData({ ...formData, weekNumber: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-[#004ac6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tiêu Đề Báo Cáo</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Báo cáo Tuần 1 - Setup môi trường"
                  value={formData.reportTitle}
                  onChange={(e) => setFormData({ ...formData, reportTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-[#004ac6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Công Việc Đã Hoàn Thành (*)</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Liệt kê các việc đã làm trong tuần..."
                  value={formData.completedTasks}
                  onChange={(e) => setFormData({ ...formData, completedTasks: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-[#004ac6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Khó Khăn & Vướng Mắc</label>
                <textarea
                  rows={2}
                  placeholder="Nêu vướng mắc cần mentor hỗ trợ..."
                  value={formData.difficulties}
                  onChange={(e) => setFormData({ ...formData, difficulties: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-[#004ac6] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Kế Hoạch Tuần Tới</label>
                <textarea
                  rows={2}
                  placeholder="Kế hoạch tuần tiếp theo..."
                  value={formData.nextPlan}
                  onChange={(e) => setFormData({ ...formData, nextPlan: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-[#004ac6] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#004ac6] px-4 py-2 font-semibold text-white hover:bg-[#003eb3]"
                >
                  Lưu Bản Nháp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Duyệt Báo Cáo - Tuần {selectedReport.weekNumber}</h3>
              <button onClick={() => setIsReviewOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Kết Quả Phê Duyệt</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus('REVIEWED')}
                    className={`rounded-xl p-2.5 font-medium border text-center transition-colors ${
                      reviewStatus === 'REVIEWED'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    ✓ Đồng Ý (REVIEWED)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus('NEEDS_REVISION')}
                    className={`rounded-xl p-2.5 font-medium border text-center transition-colors ${
                      reviewStatus === 'NEEDS_REVISION'
                        ? 'border-amber-600 bg-amber-50 text-amber-800 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    ⚠️ Cần Chỉnh Sửa
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nhận Xét Của Mentor (*)</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập nhận xét chi tiết về tiến độ công việc..."
                  value={mentorComment}
                  onChange={(e) => setMentorComment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-[#004ac6] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#004ac6] px-4 py-2 font-semibold text-white hover:bg-[#003eb3]"
                >
                  Xác Nhận Đánh Giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
