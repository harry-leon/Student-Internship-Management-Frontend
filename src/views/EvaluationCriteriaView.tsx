import React, { useState, useEffect, useCallback } from 'react';
import { Role } from '../types';
import { criterionService, EvaluationCriterionDTO } from '../api/services';
import { Can } from '../components/Can';

interface EvaluationCriteriaViewProps {
  criteria?: any[];
  currentRole?: Role;
  onAddCriterion?: (crit: any) => void;
}

export const EvaluationCriteriaView: React.FC<EvaluationCriteriaViewProps> = ({
  currentRole = 'Admin',
}) => {
  const [criteriaList, setCriteriaList] = useState<EvaluationCriterionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<EvaluationCriterionDTO | null>(null);
  const [deletingCriterion, setDeletingCriterion] = useState<EvaluationCriterionDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMaxScore, setFormMaxScore] = useState<number>(10);

  const fetchCriteria = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await criterionService.getAll();
      setCriteriaList(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Error fetching evaluation criteria:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCriteria();
  }, [fetchCriteria]);

  const handleOpenCreate = () => {
    setFormName('');
    setFormDescription('');
    setFormMaxScore(10);
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Tên tiêu chí đánh giá không được để trống');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await criterionService.create({
        criterionName: formName,
        description: formDescription,
        maxScore: Number(formMaxScore) || 10,
      });
      setIsCreateModalOpen(false);
      fetchCriteria();
    } catch (err: any) {
      setFormError(err.message || 'Không thể tạo tiêu chí đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (crit: EvaluationCriterionDTO) => {
    setEditingCriterion(crit);
    setFormName(crit.criterionName);
    setFormDescription(crit.description || '');
    setFormMaxScore(crit.maxScore || 10);
    setFormError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCriterion) return;
    if (!formName.trim()) {
      setFormError('Tên tiêu chí không được để trống');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await criterionService.update(editingCriterion.criterionId, {
        criterionName: formName,
        description: formDescription,
        maxScore: Number(formMaxScore) || 10,
      });
      setEditingCriterion(null);
      fetchCriteria();
    } catch (err: any) {
      setFormError(err.message || 'Không thể cập nhật tiêu chí');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCriterion) return;
    setIsSubmitting(true);
    try {
      await criterionService.delete(deletingCriterion.criterionId);
      setDeletingCriterion(null);
      fetchCriteria();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa tiêu chí đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-200 space-y-3.5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">grading</span>
            <h1 className="text-[20px] font-bold text-[#0b1c30] tracking-tight">
              Tiêu Chí & Thang Điểm Đánh Giá (Evaluation Rubrics)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý các tiêu chuẩn chấm điểm, mô tả chỉ số đánh giá và thang điểm tối đa cho sinh viên.
          </p>
        </div>
        <Can permission="ASSESSMENT_CREATE">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Thêm Tiêu Chí Mới</span>
          </button>
        </Can>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-[#004ac6]">
          <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#004ac6] border-t-transparent"></div>
        </div>
      ) : criteriaList.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#004ac6]">
            <span className="material-symbols-outlined text-[22px]">grading</span>
          </div>
          <h3 className="text-sm font-semibold text-[#0b1c30]">Chưa có tiêu chí đánh giá nào</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Tạo mới tiêu chuẩn đánh giá để áp dụng vào các vòng chấm điểm thực tập.
          </p>
          <Can permission="ASSESSMENT_CREATE">
            <button
              onClick={handleOpenCreate}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#003896] transition-colors"
            >
              + Thêm Tiêu Chí Mới
            </button>
          </Can>
        </div>
      ) : (
        /* Criteria Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {criteriaList.map((crit) => (
            <div
              key={crit.criterionId}
              className="rounded-xl bg-white p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-mono font-bold text-[#004ac6] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                      #{crit.criterionId}
                    </span>
                    <h3 className="text-sm font-bold text-[#0b1c30]">
                      {crit.criterionName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#004ac6]">
                      {crit.maxScore} điểm
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {crit.description || 'Tiêu chí đánh giá chất lượng thực tập theo quy định của nhà trường.'}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  Thang điểm chuẩn hóa: 0 – {crit.maxScore}
                </span>

                  <div className="flex items-center gap-1">
                    <Can permission="ASSESSMENT_UPDATE">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(crit)}
                        className="p-1 rounded text-[#004ac6] hover:bg-blue-50 transition-colors"
                        title="Sửa tiêu chí"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                    </Can>
                    <Can permission="ASSESSMENT_DELETE">
                      <button
                        type="button"
                        onClick={() => setDeletingCriterion(crit)}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Xóa tiêu chí"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </Can>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Criterion Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e2e8f0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">add_circle</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">
                  Thêm Tiêu Chí Đánh Giá Mới
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-3.5">
              {formError && (
                <div className="p-2 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#434655] mb-1">
                  Tên Tiêu Chí Đánh Giá *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="VD: Kỹ năng kỹ thuật, Thái độ làm việc..."
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#434655] mb-1">
                  Điểm Tối Đa (Max Score)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formMaxScore}
                  onChange={(e) => setFormMaxScore(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#434655] mb-1">
                  Mô Tả & Hướng Dẫn Chấm Điểm
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Tiêu chí đánh giá sự chủ động, tiến độ giao nộp..."
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#f1f5f9] pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:bg-[#e2e8f0]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8]"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Thêm Tiêu Chí'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Criterion Modal */}
      {editingCriterion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e2e8f0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e2e8f0] bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">edit</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">
                  Cập Nhật Tiêu Chí #{editingCriterion.criterionId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCriterion(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5">
              {formError && (
                <div className="p-2 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#434655] mb-1">
                  Tên Tiêu Chí Đánh Giá *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#434655] mb-1">
                  Điểm Tối Đa (Max Score)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formMaxScore}
                  onChange={(e) => setFormMaxScore(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#434655] mb-1">
                  Mô Tả & Hướng Dẫn Chấm Điểm
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#f1f5f9] pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCriterion(null)}
                  className="rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:bg-[#e2e8f0]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8]"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCriterion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30]">Xóa Tiêu Chí Đánh Giá</h3>
                <p className="text-xs text-slate-500">Xác nhận gỡ bỏ tiêu chí</p>
              </div>
            </div>

            <p className="text-xs text-[#434655]">
              Bạn có chắc chắn muốn xóa tiêu chí <strong>{deletingCriterion.criterionName}</strong>?
            </p>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setDeletingCriterion(null)}
                className="rounded-lg bg-[#f1f5f9] px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:bg-[#e2e8f0]"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700"
              >
                {isSubmitting ? 'Đang xóa...' : 'Xóa Tiêu Chí'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
