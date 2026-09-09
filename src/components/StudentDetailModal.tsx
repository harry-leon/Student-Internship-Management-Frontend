import React, { useState, useEffect } from 'react';
import { studentService, StudentDetailDTO } from '../api/services';
import { studentSubmissionService } from '../api/studentSubmissionService';
import { ExternalLink, Download, FileText, CheckCircle2, Clock, Calendar, Building, User, Mail, Phone, BookOpen, AlertCircle, Award, X } from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number | null;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  studentId,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [detail, setDetail] = useState<StudentDetailDTO | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'submissions' | 'reports' | 'grading'>('profile');
  const [downloadingZip, setDownloadingZip] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      loadDetail(studentId);
      setActiveTab('profile');
    } else {
      setDetail(null);
      setErrorMsg('');
    }
  }, [isOpen, studentId]);

  const loadDetail = async (id: number) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await studentService.getDetail(id);
      setDetail(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải thông tin chi tiết sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadZip = async (submissionId: number, fileName?: string) => {
    setDownloadingZip(true);
    try {
      await studentSubmissionService.downloadZip(submissionId, fileName);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải xuống tệp');
    } finally {
      setDownloadingZip(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-2xs">
              {detail?.student?.fullName
                ? detail.student.fullName.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
                : 'ST'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                {detail?.student?.fullName || 'Chi tiết sinh viên'}
                {detail?.student?.studentCode && (
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/80">
                    {detail.student.studentCode}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {detail?.student?.major || 'Chuyên ngành chưa cập nhật'} • {detail?.student?.className || 'Chưa xếp lớp'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-200 px-5 bg-white gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Hồ sơ & Thực tập
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'submissions'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Bài nộp ({detail?.latestSubmission ? '1' : '0'})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Báo cáo tuần ({detail?.recentReports?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('grading')}
            className={`py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'grading'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Đánh giá ({detail?.gradingSummaries?.length || 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500">Đang tải thông tin chi tiết...</p>
            </div>
          )}

          {errorMsg && !loading && (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!loading && !errorMsg && detail && (
            <>
              {/* TAB 1: PROFILE & ASSIGNMENT */}
              {activeTab === 'profile' && (
                <div className="space-y-4 text-xs">
                  {/* Personal info card */}
                  <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
                    <h4 className="font-semibold text-slate-800 mb-2.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500">
                      <User className="w-3.5 h-3.5" /> Thông tin cá nhân
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">Email:</span>
                        <span className="text-slate-900">{detail.student.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">SĐT:</span>
                        <span className="text-slate-900">{detail.student.phoneNumber || 'Chưa cập nhật'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">Chuyên ngành:</span>
                        <span className="text-slate-900">{detail.student.major || 'Chưa có'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">Lớp sinh hoạt:</span>
                        <span className="text-slate-900">{detail.student.className || 'Chưa có'}</span>
                      </div>
                      {detail.student.address && (
                        <div className="sm:col-span-2 flex items-center gap-2 text-slate-600">
                          <span className="font-medium text-slate-700">Địa chỉ:</span>
                          <span className="text-slate-900">{detail.student.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Internship Assignment Card */}
                  <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200/80">
                    <h4 className="font-semibold text-slate-800 mb-2.5 flex items-center justify-between text-xs uppercase tracking-wider text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" /> Phân công thực tập
                      </span>
                      {detail.currentAssignment && (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          detail.currentAssignment.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : detail.currentAssignment.status === 'IN PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {detail.currentAssignment.status}
                        </span>
                      )}
                    </h4>

                    {detail.currentAssignment ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <p className="text-slate-500">Kỳ thực tập:</p>
                          <p className="font-semibold text-slate-800">{detail.currentAssignment.phaseName || `Kỳ #${detail.currentAssignment.phaseId}`}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Giảng viên / Mentor:</p>
                          <p className="font-semibold text-slate-800">
                            {detail.currentAssignment.mentorFullName || `Mentor #${detail.currentAssignment.mentorId}`}
                            {detail.currentAssignment.mentorDepartment && (
                              <span className="text-slate-500 font-normal text-[11px] ml-1">
                                ({detail.currentAssignment.mentorDepartment})
                              </span>
                            )}
                          </p>
                        </div>
                        {detail.currentAssignment.assignedDate && (
                          <div>
                            <p className="text-slate-500">Ngày phân công:</p>
                            <p className="font-medium text-slate-700">
                              {new Date(detail.currentAssignment.assignedDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">Sinh viên chưa được phân công kỳ thực tập hoặc mentor phụ trách.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: SUBMISSIONS */}
              {activeTab === 'submissions' && (
                <div className="space-y-3 text-xs">
                  {detail.latestSubmission ? (
                    <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            detail.latestSubmission.submissionType === 'GITHUB'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {detail.latestSubmission.submissionType}
                          </span>
                          <span className="text-slate-500">Phiên bản: v{detail.latestSubmission.versionNo}</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">
                          Nộp lúc: {new Date(detail.latestSubmission.submittedAt).toLocaleString('vi-VN')}
                        </span>
                      </div>

                      {detail.latestSubmission.submissionType === 'GITHUB' && detail.latestSubmission.githubUrl && (
                        <div className="flex items-center justify-between p-2.5 rounded bg-white border border-slate-200">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <ExternalLink className="w-4 h-4 text-purple-600 shrink-0" />
                            <a
                              href={detail.latestSubmission.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-700 hover:underline truncate font-mono text-[11px]"
                            >
                              {detail.latestSubmission.githubUrl}
                            </a>
                          </div>
                          <a
                            href={detail.latestSubmission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs font-medium rounded bg-purple-600 text-white hover:bg-purple-700 shrink-0 transition-colors"
                          >
                            Mở GitHub
                          </a>
                        </div>
                      )}

                      {detail.latestSubmission.submissionType === 'ZIP' && (
                        <div className="flex items-center justify-between p-2.5 rounded bg-white border border-slate-200">
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <p className="font-medium text-slate-800">{detail.latestSubmission.originalFileName || 'submission.zip'}</p>
                              {detail.latestSubmission.fileSizeBytes && (
                                <p className="text-[11px] text-slate-400">
                                  {(detail.latestSubmission.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadZip(detail.latestSubmission!.submissionId, detail.latestSubmission!.originalFileName)}
                            disabled={downloadingZip}
                            className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 shrink-0 transition-colors flex items-center gap-1.5"
                          >
                            <Download className="w-3 h-3" />
                            {downloadingZip ? 'Đang tải...' : 'Tải tệp ZIP'}
                          </button>
                        </div>
                      )}

                      {detail.latestSubmission.note && (
                        <div className="p-2.5 rounded bg-white border border-slate-200">
                          <p className="text-[11px] text-slate-400 font-semibold mb-1">Ghi chú của sinh viên:</p>
                          <p className="text-slate-700 italic">{detail.latestSubmission.note}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>Chưa có bài nộp nào được ghi nhận cho sinh viên này.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: WEEKLY REPORTS */}
              {activeTab === 'reports' && (
                <div className="space-y-2.5 text-xs">
                  {detail.recentReports && detail.recentReports.length > 0 ? (
                    detail.recentReports.map((report) => (
                      <div key={report.reportId} className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">
                            Tuần {report.weekNumber}: {report.reportTitle || 'Báo cáo tiến độ'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            report.status === 'REVIEWED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : report.status === 'SUBMITTED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-slate-600 line-clamp-2">{report.completedTasks}</p>
                        {report.mentorComment && (
                          <div className="p-2 rounded bg-white border border-slate-200 text-[11px]">
                            <span className="font-semibold text-emerald-800">Nhận xét của Mentor: </span>
                            <span className="text-slate-700">{report.mentorComment}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>Chưa có báo cáo tuần nào được tạo.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: GRADING SUMMARIES */}
              {activeTab === 'grading' && (
                <div className="space-y-3 text-xs">
                  {detail.gradingSummaries && detail.gradingSummaries.length > 0 ? (
                    detail.gradingSummaries.map((form, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">
                            Vòng đánh giá: {form.roundName || `#${form.roundId}`}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            form.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {form.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-slate-600">
                          <span>Điểm tổng: <strong className="text-emerald-700">{form.totalScore ?? 'Chưa chấm'}</strong></span>
                          <span>Điểm trọng số: <strong className="text-blue-700">{form.weightedScore ?? 'Chưa chấm'}</strong></span>
                          {form.evaluatedByName && <span>Người chấm: {form.evaluatedByName}</span>}
                        </div>
                        {form.criteria && form.criteria.length > 0 && (
                          <div className="border border-slate-200 rounded overflow-hidden mt-2">
                            <table className="w-full text-left text-[11px]">
                              <thead className="bg-slate-100 text-slate-600">
                                <tr>
                                  <th className="py-1 px-2.5 font-medium">Tiêu chí</th>
                                  <th className="py-1 px-2.5 font-medium w-16 text-center">Trọng số</th>
                                  <th className="py-1 px-2.5 font-medium w-16 text-center">Điểm</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {form.criteria.map((c) => (
                                  <tr key={c.criterionId}>
                                    <td className="py-1 px-2.5 text-slate-700">{c.criterionName}</td>
                                    <td className="py-1 px-2.5 text-center text-slate-500">{c.weight}%</td>
                                    <td className="py-1 px-2.5 text-center font-semibold text-slate-800">
                                      {c.score != null ? `${c.score}/${c.maxScore}` : '-'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Award className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>Chưa có kết quả chấm điểm chính thức nào.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
