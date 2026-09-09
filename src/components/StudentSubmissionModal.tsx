import React, { useState, useEffect } from 'react';
import { Assignment, AssessmentRound } from '../types';
import { studentSubmissionService } from '../api/studentSubmissionService';

interface StudentSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignments: Assignment[];
  rounds: AssessmentRound[];
  preselectedAssignmentId?: number;
  preselectedRoundId?: number;
  onSuccess?: () => void;
}

export const StudentSubmissionModal: React.FC<StudentSubmissionModalProps> = ({
  isOpen,
  onClose,
  assignments,
  rounds,
  preselectedAssignmentId,
  preselectedRoundId,
  onSuccess,
}) => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | ''>('');
  const [selectedRoundId, setSelectedRoundId] = useState<number | ''>('');
  const [submissionType, setSubmissionType] = useState<'GITHUB' | 'ZIP'>('GITHUB');
  const [githubUrl, setGithubUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (preselectedAssignmentId) {
        setSelectedAssignmentId(preselectedAssignmentId);
      } else if (assignments.length > 0) {
        setSelectedAssignmentId(Number(assignments[0].id));
      } else {
        setSelectedAssignmentId('');
      }

      if (preselectedRoundId) {
        setSelectedRoundId(preselectedRoundId);
      } else {
        setSelectedRoundId('');
      }

      setSubmissionType('GITHUB');
      setGithubUrl('');
      setSelectedFile(null);
      setNote('');
      setErrorMsg('');
      setFieldErrors({});
    }
  }, [isOpen, preselectedAssignmentId, preselectedRoundId, assignments]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setFieldErrors((prev) => ({ ...prev, file: 'Chỉ chấp nhận tệp định dạng .zip' }));
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setFieldErrors((prev) => ({ ...prev, file: 'Dung lượng tệp không được vượt quá 20MB' }));
        return;
      }
      setSelectedFile(file);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.file;
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedAssignmentId) {
      errors.assignmentId = 'Vui lòng chọn đợt thực tập / phân công';
    }

    if (submissionType === 'GITHUB') {
      const trimmed = githubUrl.trim();
      if (!trimmed) {
        errors.githubUrl = 'Vui lòng nhập đường dẫn GitHub';
      } else if (!trimmed.startsWith('https://github.com/') && !trimmed.startsWith('https://www.github.com/')) {
        errors.githubUrl = 'Đường dẫn phải bắt đầu bằng https://github.com/ hoặc https://www.github.com/';
      }
    } else {
      if (!selectedFile) {
        errors.file = 'Vui lòng chọn tệp nén .zip để nộp';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMsg('');

    try {
      if (submissionType === 'GITHUB') {
        await studentSubmissionService.submitGithub({
          assignmentId: Number(selectedAssignmentId),
          roundId: selectedRoundId ? Number(selectedRoundId) : undefined,
          githubUrl: githubUrl.trim(),
          note: note.trim() || undefined,
        });
      } else {
        const formData = new FormData();
        formData.append('assignmentId', selectedAssignmentId.toString());
        if (selectedRoundId) {
          formData.append('roundId', selectedRoundId.toString());
        }
        if (note.trim()) {
          formData.append('note', note.trim());
        }
        formData.append('file', selectedFile!);

        await studentSubmissionService.submitZip(formData);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Nộp Bài Làm Thực Tập</h3>
              <p className="text-xs text-slate-500">Hỗ trợ đường dẫn GitHub hoặc tải lên tệp nén ZIP</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phân công thực tập <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value ? Number(e.target.value) : '')}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                fieldErrors.assignmentId ? 'border-red-300' : 'border-slate-200'
              }`}
            >
              <option value="">-- Chọn phân công thực tập --</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.phase} - {a.companyName || 'Doanh nghiệp'} (Mentor: {a.mentorName})
                </option>
              ))}
            </select>
            {fieldErrors.assignmentId && (
              <p className="text-[11px] text-red-500 mt-1">{fieldErrors.assignmentId}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Đợt đánh giá (Tùy chọn)
            </label>
            <select
              value={selectedRoundId}
              onChange={(e) => setSelectedRoundId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- Nộp bài chung cho đợt thực tập --</option>
              {rounds.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.phase})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Hình thức nộp</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSubmissionType('GITHUB')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  submissionType === 'GITHUB'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">code</span>
                <span>GitHub Link</span>
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType('ZIP')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  submissionType === 'ZIP'
                    ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">folder_zip</span>
                <span>Tệp ZIP</span>
              </button>
            </div>
          </div>

          {submissionType === 'GITHUB' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                GitHub Repository / PR URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/organization/repo-name"
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                    fieldErrors.githubUrl ? 'border-red-300' : 'border-slate-200'
                  }`}
                />
                <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-slate-400 text-[18px]">
                  link
                </span>
              </div>
              {fieldErrors.githubUrl ? (
                <p className="text-[11px] text-red-500 mt-1">{fieldErrors.githubUrl}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">
                  Đường dẫn HTTPS hợp lệ trỏ tới repo, PR hoặc release trên GitHub.
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tệp nén mã nguồn (.zip) <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="submission-file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="submission-file" className="cursor-pointer block">
                  <span className="material-symbols-outlined text-slate-400 text-[32px] mx-auto mb-1">
                    cloud_upload
                  </span>
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-blue-600">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-medium text-slate-700">
                        Nhấn để chọn tệp ZIP hoặc kéo thả vào đây
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Tối đa 20MB</p>
                    </div>
                  )}
                </label>
              </div>
              {fieldErrors.file && (
                <p className="text-[11px] text-red-500 mt-1">{fieldErrors.file}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ghi chú cho người chấm (Tùy chọn)
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mô tả tóm tắt tính năng, hướng dẫn chạy ứng dụng hoặc thông tin bổ sung..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {loading && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
              <span>{loading ? 'Đang nộp...' : 'Xác nhận nộp bài'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
