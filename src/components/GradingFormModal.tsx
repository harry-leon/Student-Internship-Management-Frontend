import React, { useState, useEffect } from 'react';
import { Role } from '../types';
import {
  AssessmentGradingForm,
  AssessmentGradingPayload,
  assessmentGradingService,
} from '../api/assessmentGradingService';

interface GradingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: number;
  roundId: number;
  currentRole: Role;
  onSuccess?: () => void;
}

export const GradingFormModal: React.FC<GradingFormModalProps> = ({
  isOpen,
  onClose,
  assignmentId,
  roundId,
  currentRole,
  onSuccess,
}) => {
  const [form, setForm] = useState<AssessmentGradingForm | null>(null);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && assignmentId && roundId) {
      loadGradingForm();
    }
  }, [isOpen, assignmentId, roundId]);

  const loadGradingForm = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await assessmentGradingService.getGradingForm(assignmentId, roundId);
      setForm(res);

      const initialScores: Record<number, number> = {};
      const initialComments: Record<number, string> = {};
      res.criteria.forEach((c) => {
        if (c.score !== undefined && c.score !== null) initialScores[c.criterionId] = c.score;
        if (c.comments) initialComments[c.criterionId] = c.comments;
      });
      setScores(initialScores);
      setComments(initialComments);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải phiếu chấm điểm');
    } finally {
      setLoading(false);
    }
  };

  // Calculate realtime scores
  const scoreValues: number[] = Object.values(scores).map((v) => Number(v) || 0);
  const calculatedTotal = scoreValues.reduce((acc: number, s: number) => acc + s, 0);
  const calculatedWeighted = (form?.criteria || []).reduce((acc: number, c) => {
    const sc = scores[c.criterionId] || 0;
    const w = c.weight || 0;
    return acc + sc * (w / 100);
  }, 0);

  const handleScoreChange = (criterionId: number, val: number, maxScore: number) => {
    const clamped = Math.max(0, Math.min(val, maxScore));
    setScores((prev) => ({ ...prev, [criterionId]: clamped }));
  };

  const handleCommentChange = (criterionId: number, val: string) => {
    setComments((prev) => ({ ...prev, [criterionId]: val }));
  };

  const buildPayload = (): AssessmentGradingPayload => {
    const items = (form?.criteria || []).map((c) => ({
      criterionId: c.criterionId,
      score: scores[c.criterionId] ?? 0,
      comments: comments[c.criterionId] || '',
    }));
    return {
      assignmentId,
      roundId,
      items,
    };
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      await assessmentGradingService.saveDraft(buildPayload());
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu bản nháp');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      await assessmentGradingService.submitGrading(buildPayload());
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi nộp điểm');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!form?.submissionId) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await assessmentGradingService.publishSubmission(form.submissionId);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi công bố điểm');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Phiếu Chấm Điểm Rubric - {form?.roundName || `Đợt ${roundId}`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sinh viên: <strong className="text-slate-800">{form?.studentName} ({form?.studentCode})</strong> | Mentor: {form?.mentorName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            ⚠️ {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Đang tải biểu mẫu chấm điểm...</div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Criteria List */}
            {form?.criteria.map((item, idx) => (
              <div key={item.criterionId} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Tiêu chí {idx + 1} (Trọng số {item.weight}%)</span>
                    <h4 className="font-semibold text-slate-900 text-sm mt-0.5">{item.criterionName}</h4>
                    {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-600 font-medium">Điểm (Tối đa {item.maxScore}):</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max={item.maxScore}
                      disabled={form.status === 'PUBLISHED' || currentRole === 'Student'}
                      value={scores[item.criterionId] ?? ''}
                      onChange={(e) => handleScoreChange(item.criterionId, parseFloat(e.target.value) || 0, item.maxScore)}
                      className="w-20 rounded-lg border border-slate-300 bg-white p-2 text-sm font-bold text-center text-[#004ac6] focus:border-[#004ac6] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Nhận xét cho tiêu chí này (tùy chọn)..."
                    disabled={form.status === 'PUBLISHED' || currentRole === 'Student'}
                    value={comments[item.criterionId] || ''}
                    onChange={(e) => handleCommentChange(item.criterionId, e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:border-[#004ac6] focus:outline-none"
                  />
                </div>
              </div>
            ))}

            {/* Score Summary Box & Live Grade Visualizer */}
            {(() => {
              const getRank = (score: number) => {
                if (score >= 8.5) return { label: '🌟 XUẤT SẮC', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' };
                if (score >= 7.0) return { label: '💎 GIỎI', bg: 'bg-blue-500/20 text-blue-300 border-blue-400/30' };
                if (score >= 5.5) return { label: '👍 KHÁ', bg: 'bg-amber-500/20 text-amber-300 border-amber-400/30' };
                if (score >= 4.0) return { label: '⚡ TRUNG BÌNH', bg: 'bg-orange-500/20 text-orange-300 border-orange-400/30' };
                return { label: '⚠️ CẦN CỐ GẮNG', bg: 'bg-rose-500/20 text-rose-300 border-rose-400/30' };
              };
              const rank = getRank(calculatedWeighted);

              return (
                <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 text-white flex items-center justify-between shadow-lg border border-blue-800/40">
                  <div>
                    <div className="text-[11px] text-blue-200 uppercase tracking-wider font-semibold">Tổng Điểm Trọng Số (Weighted Score)</div>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-3xl font-extrabold text-white">{calculatedWeighted.toFixed(2)}</span>
                      <span className="text-sm font-medium text-blue-300">/ 10</span>
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${rank.bg}`}>
                        {rank.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-blue-200 uppercase tracking-wider font-semibold">Điểm Thô (Raw)</div>
                    <div className="text-xl font-mono font-bold text-blue-100 mt-1">{calculatedTotal.toFixed(1)}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="text-xs text-slate-500">
            Trạng thái hiện tại: <strong className="uppercase text-blue-700">{form?.status || 'DRAFT'}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Đóng
            </button>

            {currentRole !== 'Student' && form?.status !== 'PUBLISHED' && (
              <>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSaveDraft}
                  className="rounded-xl border border-[#004ac6] text-[#004ac6] px-4 py-2 text-xs font-semibold hover:bg-blue-50"
                >
                  Lưu Nháp
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="rounded-xl bg-[#004ac6] text-white px-4 py-2 text-xs font-semibold hover:bg-[#003eb3] shadow-xs"
                >
                  Nộp Điểm
                </button>
              </>
            )}

            {currentRole === 'Admin' && form?.status === 'SUBMITTED' && (
              <button
                type="button"
                disabled={submitting}
                onClick={handlePublish}
                className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-xs font-semibold hover:bg-emerald-700 shadow-xs"
              >
                ✓ Công Bố Điểm (Publish)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
