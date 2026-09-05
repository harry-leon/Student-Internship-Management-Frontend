import React, { useState, useEffect, useCallback } from 'react';
import { Role } from '../types';
import { roundService, phaseService, AssessmentRoundDTO, InternshipPhaseDTO } from '../api/services';
import { canManageSystemData } from '../auth/roleAccess';

interface AssessmentRoundsViewProps {
  rounds?: any[];
  currentRole?: Role;
}

export const AssessmentRoundsView: React.FC<AssessmentRoundsViewProps> = ({
  currentRole = 'Admin',
}) => {
  const [roundsList, setRoundsList] = useState<AssessmentRoundDTO[]>([]);
  const [phases, setPhases] = useState<InternshipPhaseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const canManage = canManageSystemData(currentRole as Role);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<AssessmentRoundDTO | null>(null);
  const [deletingRound, setDeletingRound] = useState<AssessmentRoundDTO | null>(null);
  const [viewingCriteriaRound, setViewingCriteriaRound] = useState<AssessmentRoundDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formPhaseId, setFormPhaseId] = useState<number>(1);
  const [formRoundName, setFormRoundName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  const fetchRoundsAndPhases = useCallback(async () => {
    setIsLoading(true);
    try {
      const [roundsRes, phasesRes] = await Promise.all([
        roundService.getAll(),
        phaseService.getAll().catch(() => []),
      ]);
      setRoundsList(Array.isArray(roundsRes) ? roundsRes : []);
      const pArr = Array.isArray(phasesRes) ? phasesRes : [];
      setPhases(pArr);
      if (pArr.length > 0) {
        setFormPhaseId(pArr[0].phaseId);
      }
    } catch (err) {
      console.error('Error fetching assessment rounds:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoundsAndPhases();
  }, [fetchRoundsAndPhases]);

  const handleOpenCreate = () => {
    setFormRoundName('');
    const today = new Date().toISOString().slice(0, 10);
    const in3Weeks = new Date(Date.now() + 21 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    setFormStartDate(today);
    setFormEndDate(in3Weeks);
    setFormDescription('');
    setFormIsActive(true);
    if (phases.length > 0) setFormPhaseId(phases[0].phaseId);
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoundName.trim() || !formStartDate || !formEndDate) {
      setFormError('Vui lòng điền đầy đủ Tên vòng, Ngày bắt đầu và Ngày kết thúc');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await roundService.create({
        phaseId: formPhaseId,
        roundName: formRoundName,
        startDate: formStartDate,
        endDate: formEndDate,
        description: formDescription,
        isActive: formIsActive,
      });
      setIsCreateModalOpen(false);
      fetchRoundsAndPhases();
    } catch (err: any) {
      setFormError(err.message || 'Không thể tạo vòng đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (r: AssessmentRoundDTO) => {
    setEditingRound(r);
    setFormPhaseId(r.phaseId);
    setFormRoundName(r.roundName);
    setFormStartDate(r.startDate);
    setFormEndDate(r.endDate);
    setFormDescription(r.description || '');
    setFormIsActive(r.isActive);
    setFormError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRound) return;
    if (!formRoundName.trim() || !formStartDate || !formEndDate) {
      setFormError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await roundService.update(editingRound.roundId, {
        phaseId: formPhaseId,
        roundName: formRoundName,
        startDate: formStartDate,
        endDate: formEndDate,
        description: formDescription,
        isActive: formIsActive,
      });
      setEditingRound(null);
      fetchRoundsAndPhases();
    } catch (err: any) {
      setFormError(err.message || 'Không thể cập nhật vòng đánh giá');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRound) return;
    setIsSubmitting(true);
    try {
      await roundService.delete(deletingRound.roundId);
      setDeletingRound(null);
      fetchRoundsAndPhases();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa vòng đánh giá');
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
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">fact_check</span>
            <h1 className="text-[20px] font-bold text-[#0b1c30] tracking-tight">
              Đợt & Vòng Đánh Giá Thực Tập (Assessment Checkpoints)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý các mốc đánh giá giữa kỳ, bảo vệ đồ án tốt nghiệp và phân bổ tiêu chí chấm điểm.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Thêm Vòng Đánh Giá</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-[#004ac6]">
          <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#004ac6] border-t-transparent"></div>
        </div>
      ) : roundsList.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#004ac6]">
            <span className="material-symbols-outlined text-[22px]">fact_check</span>
          </div>
          <h3 className="text-sm font-semibold text-[#0b1c30]">Chưa có vòng đánh giá nào</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Tạo các mốc đánh giá (Checkpoints) để giảng viên có thể chấm điểm bài nộp của sinh viên.
          </p>
          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#003896] transition-colors"
            >
              + Thêm Vòng Đánh Giá
            </button>
          )}
        </div>
      ) : (
        /* Rounds Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roundsList.map((round) => {
            const isActive = round.isActive;
            const criteriaCount = round.criteria?.length || 0;

            return (
              <div
                key={round.roundId}
                className="rounded-xl bg-white p-4 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] font-mono font-bold text-[#004ac6] bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                          #{round.roundId}
                        </span>
                        <h2 className="text-sm font-bold text-[#0b1c30]">
                          {round.roundName}
                        </h2>
                      </div>
                      <span className="text-[11.5px] text-slate-500 mt-0.5 block">
                        Đợt: <strong className="text-slate-800">{round.phaseName}</strong>
                      </span>
                    </div>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#004ac6] text-[10.5px] font-bold border border-[#dce9ff]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] animate-ping"></span>
                        ĐANG MỞ
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10.5px] font-bold border border-slate-200">
                        ĐÓNG
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 py-2 border-y border-slate-100 text-xs my-2 text-slate-600">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">schedule</span>
                      <span>{round.startDate} → {round.endDate}</span>
                    </div>
                    <span>•</span>
                    <div className="text-[11px] font-medium text-[#004ac6]">
                      {criteriaCount} tiêu chí chấm điểm
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                    {round.description || 'Vòng đánh giá kết quả thực tập định kỳ.'}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setViewingCriteriaRound(round)}
                    className="text-[#004ac6] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">list_alt</span>
                    <span>Xem {criteriaCount} tiêu chí</span>
                  </button>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(round)}
                        className="p-1 rounded text-[#004ac6] hover:bg-blue-50"
                        title="Sửa vòng đánh giá"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingRound(round)}
                        className="p-1 rounded text-rose-600 hover:bg-rose-50"
                        title="Xóa vòng đánh giá"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Round Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-3.5 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">add_circle</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">Thêm Vòng Đánh Giá Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateRound} className="space-y-3.5 p-5">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Đợt Thực Tập Liên Quan *
                </label>
                <select
                  value={formPhaseId}
                  onChange={(e) => setFormPhaseId(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                >
                  {phases.map((p) => (
                    <option key={p.phaseId} value={p.phaseId}>
                      {p.phaseName} ({p.startDate} - {p.endDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Tên Vòng Đánh Giá *
                </label>
                <input
                  type="text"
                  required
                  value={formRoundName}
                  onChange={(e) => setFormRoundName(e.target.value)}
                  placeholder="VD: Đánh Giá Giữa Kỳ, Báo Cáo Cuối Kỳ..."
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                    Ngày Mở Vòng *
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                    Hạn Chót Đánh Giá *
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Mô Tả / Hướng Dẫn
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Hướng dẫn sinh viên và giảng viên tham gia chấm điểm..."
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="createIsActiveRound"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#004ac6] focus:ring-[#004ac6]"
                />
                <label htmlFor="createIsActiveRound" className="text-xs font-medium text-[#0b1c30]">
                  Mở vòng đánh giá ngay (Active)
                </label>
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
                  {isSubmitting ? 'Đang lưu...' : 'Tạo Vòng Đánh Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Round Modal */}
      {editingRound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-3.5 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">edit</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">
                  Cập Nhật Vòng Đánh Giá #{editingRound.roundId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRound(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 p-5">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Đợt Thực Tập
                </label>
                <select
                  value={formPhaseId}
                  onChange={(e) => setFormPhaseId(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                >
                  {phases.map((p) => (
                    <option key={p.phaseId} value={p.phaseId}>
                      {p.phaseName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Tên Vòng Đánh Giá *
                </label>
                <input
                  type="text"
                  required
                  value={formRoundName}
                  onChange={(e) => setFormRoundName(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                    Ngày Bắt Đầu *
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                    Hạn Chót Đánh Giá *
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Mô Tả / Hướng Dẫn
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActiveRound"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#004ac6] focus:ring-[#004ac6]"
                />
                <label htmlFor="editIsActiveRound" className="text-xs font-medium text-[#0b1c30]">
                  Trạng thái mở (Active)
                </label>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#f1f5f9] pt-3">
                <button
                  type="button"
                  onClick={() => setEditingRound(null)}
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

      {/* Criteria Details Modal */}
      {viewingCriteriaRound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30]">
                  Tiêu Chí Chấm Điểm: {viewingCriteriaRound.roundName}
                </h3>
                <p className="text-xs text-slate-500">Danh sách các tiêu chuẩn áp dụng</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingCriteriaRound(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {!viewingCriteriaRound.criteria || viewingCriteriaRound.criteria.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Chưa có tiêu chí nào được gán cho vòng này.
                </div>
              ) : (
                viewingCriteriaRound.criteria.map((c, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-[#0b1c30]">{c.criterionName}</div>
                      <div className="text-[11px] text-slate-500">{c.description || 'Thang điểm chuẩn'}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#004ac6]">{c.maxScore}đ</span>
                      <span className="block text-[10px] text-slate-400">Trọng số: {c.weight}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setViewingCriteriaRound(null)}
                className="rounded-lg bg-[#004ac6] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingRound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30]">Xóa Vòng Đánh Giá</h3>
                <p className="text-xs text-slate-500">Xác nhận gỡ bỏ checkpoint</p>
              </div>
            </div>

            <p className="text-xs text-[#434655]">
              Bạn có chắc chắn muốn xóa vòng <strong>{deletingRound.roundName}</strong>?
            </p>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setDeletingRound(null)}
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
                {isSubmitting ? 'Đang xóa...' : 'Xóa Vòng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

