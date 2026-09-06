import React, { useState, useEffect } from 'react';
import { Role } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  studentTaskService,
  StudentTask,
  GroupSubmissionItem,
} from '../api/studentTaskService';
import { mentorGroupService, MentorGroupDTO } from '../api/services';

interface SubmissionsViewProps {
  currentRole: Role;
}

export const SubmissionsView: React.FC<SubmissionsViewProps> = ({ currentRole }) => {
  const { user } = useAuth();

  // Common State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ==========================================
  // Student State
  // ==========================================
  const [studentTasks, setStudentTasks] = useState<StudentTask[]>([]);
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('');
  const [overdueFilter, setOverdueFilter] = useState<boolean | undefined>(undefined);

  // Submit Modal State (Student)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState<StudentTask | null>(null);
  const [submitMode, setSubmitMode] = useState<'GITHUB' | 'ZIP'>('GITHUB');
  const [githubUrl, setGithubUrl] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTask, setHistoryTask] = useState<StudentTask | null>(null);
  const [taskSubmissions, setTaskSubmissions] = useState<GroupSubmissionItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ==========================================
  // Admin & Mentor Oversight State
  // ==========================================
  const [oversightTab, setOversightTab] = useState<'TASKS' | 'SUBMISSIONS'>('TASKS');
  const [adminTasks, setAdminTasks] = useState<StudentTask[]>([]);
  const [adminSubmissions, setAdminSubmissions] = useState<GroupSubmissionItem[]>([]);
  const [groups, setGroups] = useState<MentorGroupDTO[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | ''>('');
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('');

  // Review Modal State (Admin / Mentor)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] = useState<GroupSubmissionItem | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(8.5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSavingReview, setIsSavingReview] = useState(false);

  useEffect(() => {
    if (currentRole === 'Student') {
      loadStudentTasks();
    } else {
      loadGroups();
      loadAdminOversight();
    }
  }, [currentRole, taskStatusFilter, overdueFilter, oversightTab, selectedGroupId, adminStatusFilter]);

  const loadStudentTasks = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await studentTaskService.getMyTasks({
        status: taskStatusFilter || undefined,
        overdue: overdueFilter,
      });
      setStudentTasks(data || []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể tải danh sách nhiệm vụ');
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const res = await mentorGroupService.getAll();
      setGroups(res || []);
    } catch {
      // Ignored
    }
  };

  const loadAdminOversight = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (oversightTab === 'TASKS') {
        const data = await studentTaskService.getAdminGroupTasks({
          groupId: selectedGroupId ? Number(selectedGroupId) : undefined,
          status: adminStatusFilter || undefined,
        });
        setAdminTasks(data || []);
      } else {
        const data = await studentTaskService.getAdminGroupSubmissions({
          groupId: selectedGroupId ? Number(selectedGroupId) : undefined,
          status: adminStatusFilter || undefined,
        });
        setAdminSubmissions(data || []);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể tải dữ liệu giám sát');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmitModal = (task: StudentTask) => {
    setSelectedTaskForSubmit(task);
    setSubmitMode(task.latestSubmissionType === 'ZIP_FILE' ? 'ZIP' : 'GITHUB');
    setGithubUrl(task.latestGithubUrl || '');
    setSubmissionNote('');
    setZipFile(null);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      if (submitMode === 'GITHUB') {
        if (!githubUrl.trim()) {
          alert('Vui lòng nhập link GitHub repository');
          setIsSubmitting(false);
          return;
        }
        await studentTaskService.submitGithub(selectedTaskForSubmit.taskId, {
          githubUrl: githubUrl.trim(),
          note: submissionNote.trim() || undefined,
        });
      } else {
        if (!zipFile) {
          alert('Vui lòng chọn tệp ZIP mã nguồn');
          setIsSubmitting(false);
          return;
        }
        await studentTaskService.submitZip(
          selectedTaskForSubmit.taskId,
          zipFile,
          submissionNote.trim() || undefined
        );
      }

      setSuccessMsg('Nộp bài làm thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsSubmitModalOpen(false);
      loadStudentTasks();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Nộp bài thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenHistoryModal = async (task: StudentTask) => {
    setHistoryTask(task);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const subs = await studentTaskService.getTaskSubmissions(task.taskId);
      setTaskSubmissions(subs || []);
    } catch (err: any) {
      alert(err?.message || 'Không thể tải lịch sử nộp bài');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDownloadZip = async (sub: GroupSubmissionItem) => {
    if (!sub.groupId || !sub.submissionId) return;
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`/api/mentor-groups/${sub.groupId}/submissions/${sub.submissionId}/download`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }
      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition');
      let filename = sub.fileName || `submission_${sub.submissionId}.zip`;
      if (disposition && disposition.includes('filename=')) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      alert(err.message || 'Không thể tải xuống tệp');
    }
  };

  const handleOpenReviewModal = (sub: GroupSubmissionItem) => {
    setReviewingSubmission(sub);
    const existingRev = sub.reviews && sub.reviews.length > 0 ? sub.reviews[0] : null;
    setReviewScore(existingRev?.score ?? 8.5);
    setReviewComment(existingRev?.comment ?? '');
    setIsReviewModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingSubmission || isSavingReview) return;

    setIsSavingReview(true);
    try {
      await studentTaskService.reviewGroupSubmission(
        reviewingSubmission.groupId,
        reviewingSubmission.submissionId,
        {
          score: reviewScore,
          comment: reviewComment.trim(),
          status: 'PUBLISHED',
        }
      );
      setSuccessMsg('Chấm điểm và nhận xét thành công!');
      setTimeout(() => setSuccessMsg(''), 3000);
      setIsReviewModalOpen(false);
      loadAdminOversight();
    } catch (err: any) {
      alert(err?.message || 'Không thể lưu đánh giá');
    } finally {
      setIsSavingReview(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '--';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">Khẩn cấp</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">Cao</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">Trung bình</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Thấp</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{priority}</span>;
    }
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case 'NOT_SUBMITTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Chưa nộp bài</span>;
      case 'SUBMITTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Đã nộp bài</span>;
      case 'REVIEWED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Đã chấm điểm</span>;
      case 'ACCEPTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Đạt yêu cầu</span>;
      case 'NEEDS_CHANGES':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">Cần chỉnh sửa</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Không đạt</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  // =========================================================================
  // RENDER STUDENT VIEW
  // =========================================================================
  if (currentRole === 'Student') {
    const totalTasks = studentTasks.length;
    const notSubmittedCount = studentTasks.filter((t) => t.submissionStatus === 'NOT_SUBMITTED').length;
    const submittedCount = studentTasks.filter((t) => t.submissionStatus === 'SUBMITTED').length;
    const reviewedCount = studentTasks.filter((t) => t.submissionStatus === 'REVIEWED' || t.submissionStatus === 'ACCEPTED').length;

    return (
      <div className="space-y-4">
        {/* Header banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-[24px]">assignment_turned_in</span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Nhiệm Vụ & Bài Nộp Thực Tập</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Theo dõi danh sách các nhiệm vụ được mentor phân công trong nhóm và nộp bài làm (GitHub URL hoặc tệp ZIP)
            </p>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <span className="material-symbols-outlined text-[20px]">task</span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tổng nhiệm vụ</p>
              <p className="text-base font-bold text-slate-900">{totalTasks}</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Chưa nộp bài</p>
              <p className="text-base font-bold text-amber-600">{notSubmittedCount}</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Đã nộp bài</p>
              <p className="text-base font-bold text-indigo-600">{submittedCount}</p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Đã chấm điểm</p>
              <p className="text-base font-bold text-emerald-600">{reviewedCount}</p>
            </div>
          </div>
        </div>

        {/* Success alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-2.5">
          <select
            value={taskStatusFilter}
            onChange={(e) => setTaskStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái task</option>
            <option value="TODO">Cần làm (TODO)</option>
            <option value="IN_PROGRESS">Đang thực hiện (IN_PROGRESS)</option>
            <option value="REVIEW">Chờ duyệt (REVIEW)</option>
            <option value="DONE">Hoàn thành (DONE)</option>
          </select>

          <select
            value={overdueFilter === undefined ? '' : String(overdueFilter)}
            onChange={(e) => {
              if (e.target.value === '') setOverdueFilter(undefined);
              else setOverdueFilter(e.target.value === 'true');
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tất cả hạn chót</option>
            <option value="true">Đang quá hạn</option>
            <option value="false">Còn hạn</option>
          </select>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white py-16 rounded-xl border border-slate-200/80 text-center text-slate-400 flex flex-col items-center justify-center">
              <span className="material-symbols-outlined text-[32px] animate-spin mb-2">progress_activity</span>
              <p className="text-xs">Đang tải danh sách nhiệm vụ được giao...</p>
            </div>
          ) : studentTasks.length === 0 ? (
            <div className="bg-white py-16 rounded-xl border border-slate-200/80 text-center text-slate-400 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <span className="material-symbols-outlined text-[26px]">inbox</span>
              </div>
              <p className="text-sm font-semibold text-slate-700">Chưa có nhiệm vụ nào</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Hiện tại bạn chưa được mentor phân công nhiệm vụ nào trong nhóm thực tập.
              </p>
            </div>
          ) : (
            studentTasks.map((task) => (
              <div
                key={task.taskId}
                className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    {/* Tags row */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {task.groupName} ({task.groupCode})
                      </span>
                      {getPriorityBadge(task.priority)}
                      {task.isOverdue && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">alarm</span> Quá hạn
                        </span>
                      )}
                      {getSubmissionStatusBadge(task.submissionStatus)}
                    </div>

                    {/* Title & Desc */}
                    <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-xs text-slate-600 whitespace-pre-wrap">{task.description}</p>
                    )}

                    {/* Metadata info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span>Mentor: <strong className="text-slate-700">{task.mentorName || 'N/A'}</strong> ({task.mentorEmail})</span>
                      <span>•</span>
                      <span>Hạn chót: <strong className="text-slate-700">{formatDate(task.deadlineAt)}</strong></span>
                      <span>•</span>
                      <span>Được giao: <strong>{task.assigneeCount || 0}</strong> thành viên</span>
                    </div>

                    {/* Latest Submission summary */}
                    {task.latestSubmissionId && (
                      <div className="mt-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">v{task.latestSubmissionVersion}</span>
                          <span className="text-slate-400">•</span>
                          {task.latestSubmissionType === 'GITHUB_LINK' ? (
                            <a
                              href={task.latestGithubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
                            >
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                              {task.latestGithubUrl}
                            </a>
                          ) : (
                            <span className="text-slate-700 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-slate-400">description</span>
                              {task.latestFileName}
                            </span>
                          )}
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{formatDate(task.latestSubmissionTime)}</span>
                        </div>

                        {task.latestScore !== undefined && task.latestScore !== null && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200 font-semibold">
                            <span>Điểm: {task.latestScore}</span>
                            {task.latestFeedback && <span className="text-[11px] font-normal italic">({task.latestFeedback})</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleOpenSubmitModal(task)}
                      disabled={!task.canSubmit}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition ${
                        task.canSubmit
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">upload</span>
                      <span>{task.latestSubmissionId ? 'Nộp lại bài' : 'Nộp bài'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenHistoryModal(task)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">history</span>
                      <span>Lịch sử nộp ({task.latestSubmissionVersion || 0})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Submit Modal (Student) */}
        {isSubmitModalOpen && selectedTaskForSubmit && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedTaskForSubmit.latestSubmissionId ? 'Nộp Lại Bài Làm' : 'Nộp Bài Cho Nhiệm Vụ'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedTaskForSubmit.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmitWork} className="py-4 space-y-4">
                {/* Method selector */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">Hình thức nộp bài *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSubmitMode('GITHUB')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        submitMode === 'GITHUB'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">code</span>
                      <span>GitHub Link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSubmitMode('ZIP')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        submitMode === 'ZIP'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">folder_zip</span>
                      <span>Tệp ZIP mã nguồn</span>
                    </button>
                  </div>
                </div>

                {/* Input depending on mode */}
                {submitMode === 'GITHUB' ? (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      GitHub Repository URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username/project-repo"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Chọn file ZIP bài làm (Tối đa 50MB) *
                    </label>
                    <input
                      type="file"
                      accept=".zip,application/zip"
                      required={!zipFile}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setZipFile(e.target.files[0]);
                        }
                      }}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Ghi chú nộp bài (tùy chọn)
                  </label>
                  <textarea
                    rows={3}
                    value={submissionNote}
                    onChange={(e) => setSubmissionNote(e.target.value)}
                    placeholder="Mô tả tóm tắt những tính năng đã hoàn thiện, hướng dẫn chạy..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                    <span>{isSubmitting ? 'Đang gửi...' : 'Xác nhận nộp bài'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* History Modal (Student) */}
        {isHistoryModalOpen && historyTask && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-5 animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Lịch Sử Nộp Bài</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{historyTask.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="py-4 overflow-y-auto space-y-3 flex-1">
                {loadingHistory ? (
                  <div className="py-8 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[24px] animate-spin mb-1">progress_activity</span>
                    <p className="text-xs">Đang tải lịch sử bài nộp...</p>
                  </div>
                ) : taskSubmissions.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-xs">Chưa có bài nộp nào cho nhiệm vụ này.</p>
                  </div>
                ) : (
                  taskSubmissions.map((sub) => (
                    <div key={sub.submissionId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold font-mono">
                            Phiên bản v{sub.versionNumber}
                          </span>
                          <span className="text-slate-500">{formatDate(sub.submittedAt)}</span>
                        </div>
                        {getSubmissionStatusBadge(sub.status)}
                      </div>

                      <div className="text-xs">
                        {sub.submissionType === 'GITHUB_LINK' ? (
                          <a
                            href={sub.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline font-mono flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            {sub.githubUrl}
                          </a>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-700">{sub.fileName} ({formatFileSize(sub.fileSize)})</span>
                            <button
                              type="button"
                              onClick={() => handleDownloadZip(sub)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer hover:bg-emerald-700"
                            >
                              <span className="material-symbols-outlined text-[14px]">download</span>
                              Tải file
                            </button>
                          </div>
                        )}
                      </div>

                      {sub.note && (
                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded border border-slate-200">
                          &quot;{sub.note}&quot;
                        </p>
                      )}

                      {/* Mentor Review */}
                      {sub.reviews && sub.reviews.length > 0 && (
                        <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200 text-xs space-y-1">
                          <div className="flex items-center justify-between font-semibold text-purple-900">
                            <span>Đánh giá từ {sub.reviews[0].reviewerName}:</span>
                            <span className="px-2 py-0.5 bg-purple-200 rounded text-purple-900 font-bold">
                              {sub.reviews[0].score} / 10 điểm
                            </span>
                          </div>
                          {sub.reviews[0].comment && (
                            <p className="text-purple-800 italic">{sub.reviews[0].comment}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // RENDER ADMIN / MENTOR OVERSIGHT VIEW
  // =========================================================================
  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[24px]">troubleshoot</span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Giám Sát Nhiệm Vụ & Bài Nộp Nhóm</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổng quan tất cả các nhiệm vụ nhóm, tiến độ giao việc và bài nộp thực tập của sinh viên
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setOversightTab('TASKS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              oversightTab === 'TASKS'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nhiệm vụ ({adminTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setOversightTab('SUBMISSIONS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              oversightTab === 'SUBMISSIONS'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bài nộp ({adminSubmissions.length})
          </button>
        </div>
      </div>

      {/* Success alert */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-2.5">
        <select
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(e.target.value ? Number(e.target.value) : '')}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Tất cả các nhóm thực tập</option>
          {groups.map((g) => (
            <option key={g.groupId} value={g.groupId}>
              {g.groupName} ({g.groupCode})
            </option>
          ))}
        </select>

        <select
          value={adminStatusFilter}
          onChange={(e) => setAdminStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          {oversightTab === 'TASKS' ? (
            <>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="REVIEW">REVIEW</option>
              <option value="DONE">DONE</option>
            </>
          ) : (
            <>
              <option value="SUBMITTED">SUBMITTED (Mới nộp)</option>
              <option value="REVIEWED">REVIEWED (Đã chấm điểm)</option>
            </>
          )}
        </select>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[32px] animate-spin mb-2">progress_activity</span>
            <p className="text-xs">Đang tải dữ liệu...</p>
          </div>
        ) : oversightTab === 'TASKS' ? (
          /* Tasks Table */
          adminTasks.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-700">Không có nhiệm vụ nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Nhiệm vụ</th>
                    <th className="py-2.5 px-3">Độ ưu tiên</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3">Hạn chót</th>
                    <th className="py-2.5 px-3">Phân công</th>
                    <th className="py-2.5 px-3">Bình luận</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminTasks.map((t) => (
                    <tr key={t.taskId} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-3.5">
                        <p className="font-bold text-slate-900">{t.title}</p>
                        {t.description && <p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p>}
                      </td>
                      <td className="py-2.5 px-3">{getPriorityBadge(t.priority)}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-700">{t.status}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          <span>{formatDate(t.deadlineAt)}</span>
                          {t.isOverdue && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 text-rose-700 font-bold">
                              Quá hạn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-medium text-slate-700">{t.assignees?.length || 0} thành viên</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {t.latestSubmissionVersion ? `${t.latestSubmissionVersion} bài nộp` : '0 bài nộp'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Submissions Table */
          adminSubmissions.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-700">Không có bài nộp nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Sinh viên</th>
                    <th className="py-2.5 px-3">Nhiệm vụ</th>
                    <th className="py-2.5 px-3">Phiên bản</th>
                    <th className="py-2.5 px-3">Hình thức & Tệp</th>
                    <th className="py-2.5 px-3">Thời gian nộp</th>
                    <th className="py-2.5 px-3">Điểm / Đánh giá</th>
                    <th className="py-2.5 px-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminSubmissions.map((sub) => {
                    const rev = sub.reviews && sub.reviews.length > 0 ? sub.reviews[0] : null;
                    return (
                      <tr key={sub.submissionId} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                          {sub.submittedByName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {sub.taskTitle || 'Bài nộp chung'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                          v{sub.versionNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          {sub.submissionType === 'GITHUB_LINK' ? (
                            <a
                              href={sub.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline font-mono text-[11px] flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                              GitHub
                            </a>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDownloadZip(sub)}
                              className="text-emerald-700 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">download</span>
                              {sub.fileName}
                            </button>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{formatDate(sub.submittedAt)}</td>
                        <td className="py-2.5 px-3">
                          {rev ? (
                            <span className="font-bold text-purple-700">
                              {rev.score} đ {rev.comment && `(${rev.comment})`}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Chưa chấm</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(sub)}
                            className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-semibold text-[11px] transition cursor-pointer inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">rate_review</span>
                            <span>{rev ? 'Chấm lại' : 'Chấm điểm'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Review Modal (Admin / Mentor) */}
      {isReviewModalOpen && reviewingSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Đánh Giá & Chấm Điểm Bài Nộp</h3>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="py-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <p>Sinh viên: <strong className="text-slate-800">{reviewingSubmission.submittedByName}</strong></p>
                <p>Nhiệm vụ: <strong className="text-slate-800">{reviewingSubmission.taskTitle || 'Chung'}</strong> (v{reviewingSubmission.versionNumber})</p>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Điểm số (Thang điểm 10) *</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  required
                  value={reviewScore}
                  onChange={(e) => setReviewScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-purple-500 font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nhận xét chi tiết</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Góp ý về code chất lượng, logic xử lý, điểm cần hoàn thiện..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingReview}
                  className="px-5 py-2 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingReview && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                  <span>{isSavingReview ? 'Đang lưu...' : 'Lưu đánh giá'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
