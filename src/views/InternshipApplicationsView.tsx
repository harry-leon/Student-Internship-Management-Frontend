import React, { useState, useEffect } from 'react';
import { Role } from '../types';
import { applicationService, InternshipApplication, ApplicationStatus, ApplicationCreateDTO } from '../api/applicationService';
import { FileText, Plus, CheckCircle2, XCircle, Clock, AlertCircle, FileCheck, Search, Filter, UserCheck, Building2, Send, X } from 'lucide-react';

interface InternshipApplicationsViewProps {
  currentRole: Role;
}

export const InternshipApplicationsView: React.FC<InternshipApplicationsViewProps> = ({ currentRole }) => {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Student Create/Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<InternshipApplication | null>(null);
  const [formData, setFormData] = useState<ApplicationCreateDTO>({
    phaseId: 1,
    proposedCompanyName: '',
    positionTitle: '',
    companyMentorName: '',
    companyMentorEmail: '',
    companyMentorPhone: '',
    projectTopic: '',
  });
  const [submittingForm, setSubmittingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Admin Review Modal State
  const [selectedApp, setSelectedApp] = useState<InternshipApplication | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedMentorId, setSelectedMentorId] = useState<number>(1);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = statusFilter !== 'all' ? (statusFilter as ApplicationStatus) : undefined;
      const data = await applicationService.getApplications(statusParam);
      setApplications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải danh sách đơn đăng ký');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleOpenCreateModal = () => {
    setEditingApp(null);
    setFormData({
      phaseId: 1,
      proposedCompanyName: '',
      positionTitle: 'Thực tập sinh Java Fullstack',
      companyMentorName: '',
      companyMentorEmail: '',
      companyMentorPhone: '',
      projectTopic: '',
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingForm(true);
    setFormError(null);
    try {
      if (editingApp) {
        await applicationService.updateDraft(editingApp.applicationId, formData);
      } else {
        await applicationService.createDraft(formData);
      }
      setIsFormModalOpen(false);
      fetchApplications();
    } catch (err: any) {
      setFormError(err.message || 'Không thể lưu đơn đăng ký');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleSubmitApplication = async (appId: number) => {
    try {
      await applicationService.submit(appId);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Không thể nộp đơn');
    }
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setReviewing(true);
    try {
      await applicationService.approve(selectedApp.applicationId, {
        mentorId: selectedMentorId,
      });
      setIsReviewModalOpen(false);
      setSelectedApp(null);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi phê duyệt đơn');
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    setReviewing(true);
    try {
      await applicationService.reject(selectedApp.applicationId, rejectionReason.trim());
      setIsReviewModalOpen(false);
      setSelectedApp(null);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi từ chối đơn');
    } finally {
      setReviewing(false);
    }
  };

  const handleCancel = async (appId: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn đăng ký này?')) return;
    try {
      await applicationService.cancel(appId);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Không thể hủy đơn');
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Chờ duyệt</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Đã duyệt</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200"><XCircle className="w-3 h-3" /> Từ chối</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">Đã hủy</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Bản nháp</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight flex items-center gap-2">
            <FileCheck className="w-7 h-7 text-[#004ac6]" />
            Đăng Ký & Phê Duyệt Thực Tập
          </h1>
          <p className="text-xs text-[#64748b] mt-1">
            Quy trình sinh viên khai báo nguyện vọng thực tập và Ban Quản Lý phê duyệt phân công.
          </p>
        </div>

        {currentRole === 'Student' && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#004ac6] hover:bg-[#003ea8] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đơn Đăng Ký Mới</span>
          </button>
        )}
      </div>

      {/* 4-Step Progress Stepper Visualizer for Student Workflow */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quy Trình Duyệt Đơn Thực Tập (4 Bước)</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { step: '1', title: 'Tạo Nháp', desc: 'Sinh viên điền thông tin', icon: '📝', color: 'border-blue-500 bg-blue-50/60 text-blue-900' },
            { step: '2', title: 'Đã Nộp Đơn', desc: 'Chờ Admin xét duyệt', icon: '📤', color: 'border-amber-500 bg-amber-50/60 text-amber-900' },
            { step: '3', title: 'Admin Phê Duyệt', desc: 'Đơn được chấp thuận', icon: '✅', color: 'border-emerald-500 bg-emerald-50/60 text-emerald-900' },
            { step: '4', title: 'Phân Công Mentor', desc: 'Bắt đầu đợt thực tập', icon: '👨‍🏫', color: 'border-indigo-500 bg-indigo-50/60 text-indigo-900' },
          ].map((s) => (
            <div key={s.step} className={`p-3 rounded-xl border-l-4 ${s.color} flex items-center gap-3`}>
              <span className="text-xl">{s.icon}</span>
              <div>
                <div className="text-xs font-bold">{s.step}. {s.title}</div>
                <div className="text-[11px] opacity-80">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-wrap items-center gap-2">
        {['all', 'SUBMITTED', 'APPROVED', 'REJECTED', 'DRAFT'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              statusFilter === st
                ? 'bg-[#004ac6] text-white shadow-xs'
                : 'text-[#64748b] hover:bg-slate-100 hover:text-[#0b1c30]'
            }`}
          >
            {st === 'all'
              ? 'Tất cả'
              : st === 'SUBMITTED'
              ? 'Chờ duyệt'
              : st === 'APPROVED'
              ? 'Đã duyệt'
              : st === 'REJECTED'
              ? 'Từ chối'
              : 'Bản nháp'}
          </button>
        ))}
      </div>

      {/* Content Table / Cards */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#e2e8f0] text-center text-xs text-[#64748b]">
          Đang tải dữ liệu đơn đăng ký thực tập...
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span>{error}</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#e2e8f0] text-center">
          <FileText className="w-12 h-12 text-[#94a3b8] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#0b1c30]">Chưa có đơn đăng ký nào</h3>
          <p className="text-xs text-[#64748b] mt-1">Không có đơn đăng ký thực tập nào khớp với bộ lọc.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[#64748b] font-semibold">
                  <th className="py-3.5 px-4">Sinh Viên</th>
                  <th className="py-3.5 px-4">Công Ty Khai Báo</th>
                  <th className="py-3.5 px-4">Vị Trí & Đề Tài</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Ngày Gửi</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {applications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#0b1c30]">
                      <div>{app.studentName || `Sinh viên #${app.studentId}`}</div>
                      <div className="text-[11px] text-[#94a3b8]">MSSV: {app.studentCode || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      <div className="font-medium text-[#0b1c30]">{app.companyName || app.proposedCompanyName || 'Chưa chọn'}</div>
                      {app.companyMentorName && (
                        <div className="text-[11px] text-[#64748b]">Mentor DN: {app.companyMentorName}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#475569]">
                      <div className="font-medium">{app.positionTitle || 'Thực tập sinh'}</div>
                      {app.projectTopic && <div className="text-[11px] text-[#64748b]">Đề tài: {app.projectTopic}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(app.status)}
                      {app.rejectionReason && (
                        <div className="text-[11px] text-red-600 mt-1 max-w-xs">Lý do: {app.rejectionReason}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748b]">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {/* Admin Approve / Reject actions */}
                      {currentRole === 'Admin' && app.status === 'SUBMITTED' && (
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setIsReviewModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-[#004ac6] hover:bg-[#003ea8] text-white text-[11px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          Xem & Duyệt
                        </button>
                      )}

                      {/* Student Submit / Edit / Cancel actions */}
                      {currentRole === 'Student' && (app.status === 'DRAFT' || app.status === 'REJECTED') && (
                        <>
                          <button
                            onClick={() => handleSubmitApplication(app.applicationId)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Nộp Đơn
                          </button>
                          <button
                            onClick={() => handleCancel(app.applicationId)}
                            className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Hủy
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Create / Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] border-b border-[#e2e8f0] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0b1c30]">Tạo Đơn Đăng Ký Thực Tập</h3>
              <button onClick={() => setIsFormModalOpen(false)} className="p-1 text-[#64748b] hover:bg-slate-200/50 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDraft} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">{formError}</div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#434655] mb-1">Tên Công Ty Thực Tập</label>
                <input
                  type="text"
                  required
                  value={formData.proposedCompanyName}
                  onChange={(e) => setFormData({ ...formData, proposedCompanyName: e.target.value })}
                  placeholder="VD: Công ty Cổ phần FPT..."
                  className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#434655] mb-1">Vị Trí Thực Tập</label>
                  <input
                    type="text"
                    value={formData.positionTitle}
                    onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                    placeholder="Java Developer..."
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#434655] mb-1">Đề Tài / Dự Án</label>
                  <input
                    type="text"
                    value={formData.projectTopic}
                    onChange={(e) => setFormData({ ...formData, projectTopic: e.target.value })}
                    placeholder="Xây dựng API Backend..."
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#434655] mb-1">Mentor DN</label>
                  <input
                    type="text"
                    value={formData.companyMentorName}
                    onChange={(e) => setFormData({ ...formData, companyMentorName: e.target.value })}
                    placeholder="Họ tên..."
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#434655] mb-1">Email Mentor DN</label>
                  <input
                    type="email"
                    value={formData.companyMentorEmail}
                    onChange={(e) => setFormData({ ...formData, companyMentorEmail: e.target.value })}
                    placeholder="mentor@company.com"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#434655] mb-1">SĐT Mentor DN</label>
                  <input
                    type="text"
                    value={formData.companyMentorPhone}
                    onChange={(e) => setFormData({ ...formData, companyMentorPhone: e.target.value })}
                    placeholder="0901234567"
                    className="w-full px-3 py-2 text-xs border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#f1f5f9] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#64748b] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="px-4 py-2 text-xs font-semibold bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {submittingForm ? 'Đang Lưu...' : 'Lưu Nháp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Review & Approve Modal */}
      {isReviewModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] border-b border-[#e2e8f0] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0b1c30]">Phê Duyệt Đơn Đăng Ký #{selectedApp.applicationId}</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="p-1 text-[#64748b] hover:bg-slate-200/50 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-200">
                <div><strong className="text-[#0b1c30]">Sinh viên:</strong> {selectedApp.studentName} ({selectedApp.studentCode})</div>
                <div><strong className="text-[#0b1c30]">Công ty đăng ký:</strong> {selectedApp.proposedCompanyName || selectedApp.companyName || 'N/A'}</div>
                <div><strong className="text-[#0b1c30]">Vị trí:</strong> {selectedApp.positionTitle || 'N/A'}</div>
                <div><strong className="text-[#0b1c30]">Đề tài:</strong> {selectedApp.projectTopic || 'N/A'}</div>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">Chọn Giảng Viên Hướng Dẫn (Mentor) Phụ Trách</label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                >
                  <option value={1}>GV. Nguyễn Văn Thành (Khoa CNTT)</option>
                  <option value={2}>GV. Tran Van B (Khoa CNTT)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">Lý do nếu Từ Chối (Optional cho Approve)</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Nhập lý do nếu từ chối đơn..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#e2e8f0] rounded-xl focus:border-[#004ac6] outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#f1f5f9] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={reviewing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Từ Chối
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={reviewing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {reviewing ? 'Đang Xử Lý...' : 'Duyệt & Phân Công'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
