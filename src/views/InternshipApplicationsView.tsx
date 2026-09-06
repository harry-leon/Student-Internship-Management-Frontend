import React, { useState, useEffect, useCallback } from 'react';
import { Role } from '../types';
import { applicationService, InternshipApplication, ApplicationStatus, ApplicationCreateDTO } from '../api/applicationService';
import { mentorService, phaseService, MentorDTO, InternshipPhaseDTO } from '../api/services';
import { PageContainer, PageHeader, Card, Button, Badge, EmptyState } from '../components/ui';
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Building2,
  Send,
  X,
  UserCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface InternshipApplicationsViewProps {
  currentRole: Role;
}

export const InternshipApplicationsView: React.FC<InternshipApplicationsViewProps> = ({ currentRole }) => {
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mentors and Phases for real options
  const [availableMentors, setAvailableMentors] = useState<MentorDTO[]>([]);
  const [availablePhases, setAvailablePhases] = useState<InternshipPhaseDTO[]>([]);

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
  const [selectedMentorId, setSelectedMentorId] = useState<number>(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const fetchApplications = useCallback(async () => {
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
  }, [statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Load mentors and phases once
  useEffect(() => {
    mentorService.getAll().then((res) => {
      const list = Array.isArray(res) ? res : [];
      setAvailableMentors(list);
      if (list.length > 0) setSelectedMentorId(list[0].mentorId);
    }).catch(() => {});

    phaseService.getAll().then((res) => {
      const list = Array.isArray(res) ? res : [];
      setAvailablePhases(list);
      if (list.length > 0) {
        setFormData((prev) => ({ ...prev, phaseId: list[0].phaseId }));
      }
    }).catch(() => {});
  }, []);

  const handleOpenCreateModal = () => {
    setEditingApp(null);
    setFormData({
      phaseId: availablePhases[0]?.phaseId || 1,
      proposedCompanyName: '',
      positionTitle: '',
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
    if (!window.confirm('Bạn có chắc chắn muốn nộp đơn này đến Ban Quản Lý để xét duyệt?')) return;
    try {
      await applicationService.submit(appId);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Không thể nộp đơn');
    }
  };

  const handleCancel = async (appId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đăng ký này?')) return;
    try {
      await applicationService.cancel(appId);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Không thể hủy đơn');
    }
  };

  const handleOpenReviewModal = (app: InternshipApplication) => {
    setSelectedApp(app);
    setRejectionReason('');
    if (availableMentors.length > 0) {
      setSelectedMentorId(availableMentors[0].mentorId);
    }
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    if (!selectedMentorId) {
      alert('Vui lòng chọn giảng viên hướng dẫn phụ trách!');
      return;
    }
    setReviewing(true);
    try {
      await applicationService.approve(selectedApp.applicationId, { mentorId: selectedMentorId });
      setIsReviewModalOpen(false);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Không thể phê duyệt đơn');
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    setReviewing(true);
    try {
      await applicationService.reject(selectedApp.applicationId, rejectionReason);
      setIsReviewModalOpen(false);
      fetchApplications();
    } catch (err: any) {
      alert(err.message || 'Không thể từ chối đơn');
    } finally {
      setReviewing(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (app.studentName && app.studentName.toLowerCase().includes(q)) ||
      (app.studentCode && app.studentCode.toLowerCase().includes(q)) ||
      (app.proposedCompanyName && app.proposedCompanyName.toLowerCase().includes(q)) ||
      (app.companyName && app.companyName.toLowerCase().includes(q)) ||
      (app.positionTitle && app.positionTitle.toLowerCase().includes(q))
    );
  });

  return (
    <PageContainer>
      <PageHeader
        title="Đăng Ký & Phê Duyệt Thực Tập"
        description="Quy trình sinh viên khai báo nguyện vọng thực tập và Ban Quản Lý phê duyệt phân công."
        icon={FileCheck}
        actions={
          currentRole === 'Student' ? (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleOpenCreateModal}
            >
              Tạo Đơn Đăng Ký
            </Button>
          ) : undefined
        }
      />

      {/* 4-Step Progress Stepper Visualizer */}
      <Card padding="compact">
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
          Quy Trình Duyệt Đơn Thực Tập (4 Bước)
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            { step: '1', title: 'Tạo Nháp', desc: 'Sinh viên điền thông tin', icon: '📝', color: 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300' },
            { step: '2', title: 'Đã Nộp Đơn', desc: 'Chờ Admin xét duyệt', icon: '📤', color: 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300' },
            { step: '3', title: 'Admin Phê Duyệt', desc: 'Đơn được chấp thuận', icon: '✅', color: 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300' },
            { step: '4', title: 'Phân Công Mentor', desc: 'Bắt đầu đợt thực tập', icon: '👨‍🏫', color: 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-300' },
          ].map((s) => (
            <div key={s.step} className={`p-2.5 rounded-xl border-l-3.5 ${s.color} flex items-center gap-2.5 transition-colors`}>
              <span className="text-lg">{s.icon}</span>
              <div>
                <div className="text-xs font-bold">{s.step}. {s.title}</div>
                <div className="text-[10.5px] opacity-80">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Toolbar Filters & Search */}
      <Card padding="compact">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'SUBMITTED', label: 'Chờ duyệt' },
              { key: 'APPROVED', label: 'Đã duyệt' },
              { key: 'REJECTED', label: 'Từ chối' },
              { key: 'DRAFT', label: 'Bản nháp' },
            ].map((st) => (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  statusFilter === st.key
                    ? 'bg-[#004ac6] text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3 py-1.5 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Tìm theo SV, công ty, vị trí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Content Table */}
      {loading ? (
        <Card padding="normal" className="text-center py-12 text-slate-500 dark:text-slate-400 text-xs">
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#004ac6] dark:border-blue-400 border-t-transparent"></div>
            <span>Đang tải danh sách đơn đăng ký thực tập...</span>
          </div>
        </Card>
      ) : error ? (
        <Card padding="normal" className="border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </Card>
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="Chưa có đơn đăng ký nào"
          description="Không tìm thấy đơn đăng ký thực tập nào phù hợp với bộ lọc hiện tại."
          action={
            currentRole === 'Student' ? (
              <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreateModal}>
                Tạo Đơn Đăng Ký
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card padding="compact" className="overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  <th className="py-2.5 px-3.5">Sinh Viên</th>
                  <th className="py-2.5 px-3.5">Công Ty Khai Báo</th>
                  <th className="py-2.5 px-3.5">Vị Trí & Đề Tài</th>
                  <th className="py-2.5 px-3.5">Trạng Thái</th>
                  <th className="py-2.5 px-3.5">Ngày Gửi</th>
                  <th className="py-2.5 px-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-slate-800 dark:text-slate-200">
                {filteredApplications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{app.studentName}</div>
                      <div className="font-mono text-[10.5px] text-[#004ac6] dark:text-blue-400">{app.studentCode}</div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.proposedCompanyName || app.companyName || 'Campus Lab'}</span>
                      </div>
                      {app.companyMentorName && (
                        <div className="text-[10.5px] text-slate-500 dark:text-slate-400">
                          Mentor DN: {app.companyMentorName}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{app.positionTitle || 'Chưa cập nhật'}</div>
                      <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{app.projectTopic || 'Chưa có đề tài'}</div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <Badge status={app.status} dot />
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap space-x-1.5">
                      {/* Admin Approve / Reject actions */}
                      {currentRole === 'Admin' && app.status === 'SUBMITTED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={UserCheck}
                          onClick={() => handleOpenReviewModal(app)}
                        >
                          Duyệt Đơn
                        </Button>
                      )}

                      {/* Student Submit / Cancel actions */}
                      {currentRole === 'Student' && (app.status === 'DRAFT' || app.status === 'REJECTED') && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Send}
                            onClick={() => handleSubmitApplication(app.applicationId)}
                          >
                            Nộp Đơn
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancel(app.applicationId)}
                          >
                            Hủy
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Student Create / Edit Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tạo Đơn Đăng Ký Thực Tập</h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDraft} className="p-5 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Đợt Thực Tập *
                </label>
                <select
                  value={formData.phaseId}
                  onChange={(e) => setFormData({ ...formData, phaseId: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                >
                  {availablePhases.map((p) => (
                    <option key={p.phaseId} value={p.phaseId}>
                      {p.phaseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Công Ty Thực Tập *
                </label>
                <input
                  type="text"
                  required
                  value={formData.proposedCompanyName}
                  onChange={(e) => setFormData({ ...formData, proposedCompanyName: e.target.value })}
                  placeholder="VD: FPT Software, Viettel Telecom, v.v."
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vị Trí Thực Tập
                  </label>
                  <input
                    type="text"
                    value={formData.positionTitle}
                    onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                    placeholder="Java Developer, Tester..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đề Tài / Dự Án
                  </label>
                  <input
                    type="text"
                    value={formData.projectTopic}
                    onChange={(e) => setFormData({ ...formData, projectTopic: e.target.value })}
                    placeholder="Hệ thống quản lý..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mentor DN
                  </label>
                  <input
                    type="text"
                    value={formData.companyMentorName}
                    onChange={(e) => setFormData({ ...formData, companyMentorName: e.target.value })}
                    placeholder="Họ tên..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Mentor
                  </label>
                  <input
                    type="email"
                    value={formData.companyMentorEmail}
                    onChange={(e) => setFormData({ ...formData, companyMentorEmail: e.target.value })}
                    placeholder="mentor@dn.com"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SĐT Mentor
                  </label>
                  <input
                    type="text"
                    value={formData.companyMentorPhone}
                    onChange={(e) => setFormData({ ...formData, companyMentorPhone: e.target.value })}
                    placeholder="09..."
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={submittingForm}
                >
                  {submittingForm ? 'Đang Lưu...' : 'Lưu Nháp'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Review & Approve Modal */}
      {isReviewModalOpen && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Phê Duyệt Đơn Đăng Ký #{selectedApp.applicationId}
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700">
                <div><strong className="text-slate-900 dark:text-white">Sinh viên:</strong> {selectedApp.studentName} ({selectedApp.studentCode})</div>
                <div><strong className="text-slate-900 dark:text-white">Công ty:</strong> {selectedApp.proposedCompanyName || selectedApp.companyName || 'N/A'}</div>
                <div><strong className="text-slate-900 dark:text-white">Vị trí:</strong> {selectedApp.positionTitle || 'N/A'}</div>
                <div><strong className="text-slate-900 dark:text-white">Đề tài:</strong> {selectedApp.projectTopic || 'N/A'}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chọn Giảng Viên Hướng Dẫn (Mentor) Phụ Trách *
                </label>
                <select
                  value={selectedMentorId}
                  onChange={(e) => setSelectedMentorId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                >
                  {availableMentors.map((m) => (
                    <option key={m.mentorId} value={m.mentorId}>
                      {m.fullName} ({m.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lý do nếu Từ Chối (Tùy chọn)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Nhập lý do nếu từ chối đơn..."
                  rows={3}
                  className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-[#004ac6] dark:focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleReject}
                  disabled={reviewing}
                >
                  Từ Chối
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApprove}
                  disabled={reviewing}
                >
                  {reviewing ? 'Đang Xử Lý...' : 'Duyệt & Phân Công'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
