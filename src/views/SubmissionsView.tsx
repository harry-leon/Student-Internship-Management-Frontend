import React, { useState, useEffect } from 'react';
import { Role, StudentSubmission, StudentSubmissionType, InternshipPhase, AssessmentRound, Assignment } from '../types';
import { studentSubmissionService } from '../api/studentSubmissionService';
import { StudentSubmissionModal } from '../components/StudentSubmissionModal';
import { phaseService, roundService, assignmentService } from '../api/services';
import { mapPhaseFromDTO, mapRoundFromDTO, mapAssignmentFromDTO } from '../api/mappers';

interface SubmissionsViewProps {
  currentRole: Role;
}

export const SubmissionsView: React.FC<SubmissionsViewProps> = ({ currentRole }) => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown filter data
  const [phases, setPhases] = useState<InternshipPhase[]>([]);
  const [rounds, setRounds] = useState<AssessmentRound[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Filter state
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | ''>('');
  const [selectedRoundId, setSelectedRoundId] = useState<number | ''>('');
  const [selectedType, setSelectedType] = useState<StudentSubmissionType | ''>('');
  const [studentCodeQuery, setStudentCodeQuery] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [detailSubmission, setDetailSubmission] = useState<StudentSubmission | null>(null);

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [selectedPhaseId, selectedRoundId, selectedType, page, pageSize]);

  const loadFilterData = async () => {
    try {
      const [phaseData, roundData, assignmentData] = await Promise.all([
        phaseService.getAll(),
        roundService.getAll(),
        assignmentService.getAll(),
      ]);
      setPhases(Array.isArray(phaseData) ? phaseData.map(mapPhaseFromDTO) : []);
      setRounds(Array.isArray(roundData) ? roundData.map(mapRoundFromDTO) : []);
      setAssignments(Array.isArray(assignmentData) ? assignmentData.map(mapAssignmentFromDTO) : []);
    } catch {
      // Ignored non-critical filter lookup error
    }
  };

  const loadSubmissions = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let res: StudentSubmission[] & { _page?: any };

      if (currentRole === 'Student') {
        res = await studentSubmissionService.getMySubmissions({
          roundId: selectedRoundId ? Number(selectedRoundId) : undefined,
          type: selectedType || undefined,
          page,
          size: pageSize,
          sortBy: 'submittedAt',
          sortDirection: 'DESC',
        });
      } else {
        res = await studentSubmissionService.getSubmissions({
          phaseId: selectedPhaseId ? Number(selectedPhaseId) : undefined,
          roundId: selectedRoundId ? Number(selectedRoundId) : undefined,
          studentCode: studentCodeQuery.trim() || undefined,
          type: selectedType || undefined,
          page,
          size: pageSize,
          sortBy: 'submittedAt',
          sortDirection: 'DESC',
        });
      }

      setSubmissions(res || []);
      if (res?._page) {
        setTotalElements(res._page.totalElements ?? res.length);
        setTotalPages(res._page.totalPages ?? 1);
      } else {
        setTotalElements(res?.length || 0);
        setTotalPages(Math.ceil((res?.length || 0) / pageSize) || 1);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải danh sách bài nộp');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadSubmissions();
  };

  const handleResetFilters = () => {
    setSelectedPhaseId('');
    setSelectedRoundId('');
    setSelectedType('');
    setStudentCodeQuery('');
    setPage(0);
  };

  const handleDownloadZip = async (sub: StudentSubmission) => {
    try {
      await studentSubmissionService.downloadZip(sub.submissionId, sub.originalFileName);
    } catch (err: any) {
      alert(err.message || 'Không thể tải xuống tệp');
    }
  };

  const handleDelete = async (sub: StudentSubmission) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài nộp phiên bản v${sub.versionNo}?`)) {
      return;
    }
    try {
      await studentSubmissionService.deleteSubmission(sub.submissionId);
      setSuccessMsg(`Đã xóa bài nộp v${sub.versionNo} thành công`);
      setTimeout(() => setSuccessMsg(''), 3000);
      loadSubmissions();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa bài nộp');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

  // Metrics calculation
  const totalCount = totalElements;
  const githubCount = submissions.filter((s) => s.submissionType === 'GITHUB').length;
  const zipCount = submissions.filter((s) => s.submissionType === 'ZIP').length;

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[24px]">upload_file</span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Bài Nộp Thực Tập</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi, mở mã nguồn GitHub và tải xuống tệp bài làm thực tập của sinh viên
          </p>
        </div>

        {currentRole === 'Student' && (
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Nộp bài mới</span>
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tổng bài nộp</p>
            <p className="text-base font-bold text-slate-900">{totalCount}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <span className="material-symbols-outlined text-[20px]">code</span>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">GitHub Links</p>
            <p className="text-base font-bold text-slate-900">{githubCount}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <span className="material-symbols-outlined text-[20px]">folder_zip</span>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Tệp nén ZIP</p>
            <p className="text-base font-bold text-slate-900">{zipCount}</p>
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
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          {currentRole !== 'Student' && (
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <input
                type="text"
                value={studentCodeQuery}
                onChange={(e) => setStudentCodeQuery(e.target.value)}
                placeholder="Tìm mã SV..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white"
              />
              <span className="material-symbols-outlined absolute left-2 top-2 text-slate-400 text-[16px]">
                search
              </span>
            </form>
          )}

          {currentRole !== 'Student' && (
            <select
              value={selectedPhaseId}
              onChange={(e) => {
                setSelectedPhaseId(e.target.value ? Number(e.target.value) : '');
                setPage(0);
              }}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả đợt thực tập</option>
              {phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedRoundId}
            onChange={(e) => {
              setSelectedRoundId(e.target.value ? Number(e.target.value) : '');
              setPage(0);
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tất cả đợt chấm</option>
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value as StudentSubmissionType | '');
              setPage(0);
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Tất cả hình thức</option>
            <option value="GITHUB">GitHub URL</option>
            <option value="ZIP">Tệp ZIP</option>
          </select>
        </div>

        {(selectedPhaseId || selectedRoundId || selectedType || studentCodeQuery) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">clear_all</span>
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[32px] animate-spin mb-2">progress_activity</span>
            <p className="text-xs">Đang tải danh sách bài nộp...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <span className="material-symbols-outlined text-[26px]">inbox</span>
            </div>
            <p className="text-sm font-semibold text-slate-700">Chưa có bài nộp nào</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {currentRole === 'Student'
                ? 'Bạn chưa nộp bài làm nào. Hãy bấm "+ Nộp bài mới" để gửi link GitHub hoặc tệp ZIP.'
                : 'Không tìm thấy bài nộp nào phù hợp với bộ lọc hiện tại.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Sinh viên</th>
                  <th className="py-2.5 px-3">Đợt đánh giá</th>
                  <th className="py-2.5 px-3">Hình thức</th>
                  <th className="py-2.5 px-3">Phiên bản</th>
                  <th className="py-2.5 px-3">Chi tiết bài nộp</th>
                  <th className="py-2.5 px-3">Thời gian nộp</th>
                  <th className="py-2.5 px-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {submissions.map((sub) => (
                  <tr key={sub.submissionId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px] shrink-0">
                          {sub.studentFullName ? sub.studentFullName.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{sub.studentFullName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{sub.studentCode}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-800">
                        {sub.roundName || 'Chung cho đợt thực tập'}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      {sub.submissionType === 'GITHUB' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <span className="material-symbols-outlined text-[13px]">code</span>
                          GitHub
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="material-symbols-outlined text-[13px]">folder_zip</span>
                          ZIP File
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-slate-700">v{sub.versionNo}</span>
                        {sub.isLatest && (
                          <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Mới nhất
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      {sub.submissionType === 'GITHUB' ? (
                        <a
                          href={sub.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-mono text-[11px] hover:underline flex items-center gap-1 truncate max-w-[220px]"
                          title={sub.githubUrl}
                        >
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          <span className="truncate">{sub.githubUrl}</span>
                        </a>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-600 truncate max-w-[220px]">
                          <span className="material-symbols-outlined text-slate-400 text-[15px]">description</span>
                          <span className="truncate font-medium">{sub.originalFileName}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            ({formatFileSize(sub.fileSizeBytes)})
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {formatDate(sub.submittedAt)}
                    </td>

                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailSubmission(sub)}
                          className="p-1 text-slate-500 hover:text-[#004ac6] hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Xem chi tiết bài nộp"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </button>

                        {sub.submissionType === 'GITHUB' ? (
                          <a
                            href={sub.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Mở liên kết GitHub"
                          >
                            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDownloadZip(sub)}
                            className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title="Tải xuống tệp ZIP"
                          >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                          </button>
                        )}

                        {(currentRole === 'Admin' || currentRole === 'Student') && (
                          <button
                            type="button"
                            onClick={() => handleDelete(sub)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Xóa bài nộp"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị {submissions.length} / {totalElements} bài nộp
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(0);
              }}
              className="px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden"
            >
              <option value="10">10 / trang</option>
              <option value="20">20 / trang</option>
              <option value="50">50 / trang</option>
            </select>

            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              className="px-2 py-1 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              Trước
            </button>
            <span>
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-2 py-1 border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Submission Detail Modal */}
      {detailSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200/90 w-full max-w-lg p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                  detailSubmission.submissionType === 'GITHUB'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {detailSubmission.submissionType}
                </span>
                <h3 className="text-sm font-bold text-slate-900">Chi Tiết Bài Nộp</h3>
                <span className="font-mono text-xs px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-semibold">
                  v{detailSubmission.versionNo}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDetailSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              {/* Student info */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500 block text-[11px]">Sinh viên:</span>
                  <span className="font-semibold text-slate-800">{detailSubmission.studentFullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Mã sinh viên:</span>
                  <span className="font-mono font-medium text-slate-700">{detailSubmission.studentCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Đợt đánh giá:</span>
                  <span className="text-slate-700">{detailSubmission.roundName || 'Đợt chung'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Thời gian nộp:</span>
                  <span className="text-slate-700">{formatDate(detailSubmission.submittedAt)}</span>
                </div>
              </div>

              {/* Artifact link / download */}
              <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Nội dung bài nộp
                </span>
                {detailSubmission.submissionType === 'GITHUB' ? (
                  <div className="flex items-center justify-between gap-2 p-2 bg-white rounded border border-slate-200">
                    <span className="font-mono text-blue-600 truncate">{detailSubmission.githubUrl}</span>
                    <a
                      href={detailSubmission.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors shrink-0 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      Mở GitHub
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 p-2 bg-white rounded border border-slate-200">
                    <div>
                      <p className="font-medium text-slate-800">{detailSubmission.originalFileName || 'submission.zip'}</p>
                      {detailSubmission.fileSizeBytes && (
                        <p className="text-[10.5px] text-slate-400">{formatFileSize(detailSubmission.fileSizeBytes)}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadZip(detailSubmission)}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      Tải tệp ZIP
                    </button>
                  </div>
                )}
              </div>

              {/* Note */}
              <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Ghi chú của sinh viên
                </span>
                <p className="text-slate-700 italic whitespace-pre-wrap leading-relaxed">
                  {detailSubmission.note || 'Không có ghi chú nào.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailSubmission(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Student Submit Modal */}
      <StudentSubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        assignments={assignments}
        rounds={rounds}
        onSuccess={() => {
          setSuccessMsg('Nộp bài làm thành công!');
          setTimeout(() => setSuccessMsg(''), 3000);
          loadSubmissions();
        }}
      />
    </div>
  );
};
