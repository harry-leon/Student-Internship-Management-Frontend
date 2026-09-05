import React, { useState, useEffect, useCallback } from 'react';
import { InternshipPhase, Role } from '../types';
import { phaseService, InternshipPhaseDTO } from '../api/services';
import { canManageSystemData } from '../auth/roleAccess';

interface PhasesViewProps {
  phases?: InternshipPhase[];
  currentRole?: Role;
  onConfigurePhase?: (phase: InternshipPhase) => void;
}

export const PhasesView: React.FC<PhasesViewProps> = ({
  phases: propPhases,
  currentRole = 'Admin',
}) => {
  const [phasesList, setPhasesList] = useState<InternshipPhase[]>(propPhases || []);
  const [isLoading, setIsLoading] = useState(false);
  const canManage = canManageSystemData(currentRole as Role);

  // CRUD State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<InternshipPhase | null>(null);
  const [deletingPhase, setDeletingPhase] = useState<InternshipPhase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [formPhaseName, setFormPhaseName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formDescription, setFormDescription] = useState('');

  const fetchPhases = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await phaseService.getAll();
      const dtos: InternshipPhaseDTO[] = Array.isArray(res) ? res : [];
      const now = new Date();

      const mapped: InternshipPhase[] = dtos.map((dto) => {
        const start = new Date(dto.startDate);
        const end = new Date(dto.endDate);
        let status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' = 'UPCOMING';
        if (now > end) {
          status = 'COMPLETED';
        } else if (now >= start && now <= end) {
          status = 'ACTIVE';
        }

        const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const passedDays = Math.max(0, Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        const progress = status === 'COMPLETED' ? 100 : status === 'UPCOMING' ? 0 : Math.min(100, Math.round((passedDays / totalDays) * 100));
        const remainingWeeks = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7)));

        return {
          id: String(dto.phaseId),
          name: dto.phaseName,
          term: 'Spring 2026',
          startDate: dto.startDate,
          endDate: dto.endDate,
          status,
          progressPercent: progress,
          weeksRemaining: remainingWeeks,
          totalStudents: 0,
          totalMentors: 0,
          scheduledRounds: 0,
          targetMilestone: dto.description || 'Đợt thực tập doanh nghiệp',
        };
      });

      setPhasesList(mapped);
    } catch (err) {
      console.error('Error fetching phases from API:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhases();
  }, [fetchPhases]);

  const handleOpenCreate = () => {
    setFormPhaseName('');
    const today = new Date().toISOString().slice(0, 10);
    const in3Months = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    setFormStartDate(today);
    setFormEndDate(in3Months);
    setFormDescription('');
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleCreatePhase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPhaseName.trim() || !formStartDate || !formEndDate) {
      setFormError('Vui lòng điền đầy đủ Tên đợt, Ngày bắt đầu và Ngày kết thúc');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await phaseService.create({
        phaseName: formPhaseName,
        startDate: formStartDate,
        endDate: formEndDate,
        description: formDescription,
      });
      setIsCreateModalOpen(false);
      fetchPhases();
    } catch (err: any) {
      setFormError(err.message || 'Không thể tạo đợt thực tập');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (p: InternshipPhase) => {
    setEditingPhase(p);
    setFormPhaseName(p.name);
    setFormStartDate(p.startDate);
    setFormEndDate(p.endDate);
    setFormDescription(p.targetMilestone || '');
    setFormError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhase) return;
    if (!formPhaseName.trim() || !formStartDate || !formEndDate) {
      setFormError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await phaseService.update(Number(editingPhase.id), {
        phaseName: formPhaseName,
        startDate: formStartDate,
        endDate: formEndDate,
        description: formDescription,
      });
      setEditingPhase(null);
      fetchPhases();
    } catch (err: any) {
      setFormError(err.message || 'Không thể cập nhật đợt thực tập');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPhase) return;
    setIsSubmitting(true);
    try {
      await phaseService.delete(Number(deletingPhase.id));
      setDeletingPhase(null);
      fetchPhases();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa đợt thực tập');
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
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">calendar_month</span>
            <h1 className="text-[20px] font-bold text-[#0b1c30] tracking-tight">
              Quản Lý Đợt Thực Tập (Operational Phases)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lịch trình kỳ thực tập, mốc thời gian đánh giá, tiến độ học kỳ và phân bổ sinh viên.
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003ea8] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Thêm Đợt Thực Tập</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-[#004ac6]">
          <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#004ac6] border-t-transparent"></div>
        </div>
      ) : phasesList.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#004ac6]">
            <span className="material-symbols-outlined text-[22px]">calendar_month</span>
          </div>
          <h3 className="text-sm font-semibold text-[#0b1c30]">Chưa có đợt thực tập nào</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Tạo mới một đợt thực tập để bắt đầu phân công sinh viên và thiết lập các mốc đánh giá.
          </p>
          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#003896] transition-colors"
            >
              + Thêm Đợt Thực Tập
            </button>
          )}
        </div>
      ) : (
        /* Phase Cards List */
        <div className="space-y-4">
          {phasesList.map((p) => {
            const isActive = p.status === 'ACTIVE';
            const isUpcoming = p.status === 'UPCOMING';
            const isCompleted = p.status === 'COMPLETED';

            return (
              <div
                key={p.id}
                className="rounded-xl bg-white p-5 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <h2 className="text-base font-bold text-[#0b1c30]">
                        {p.name}
                      </h2>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#004ac6] text-[10.5px] font-bold border border-[#dce9ff]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] animate-ping"></span>
                          ACTIVE
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eaddff] text-[#5a00c6] text-[10.5px] font-bold border border-[#d2bbff]">
                          UPCOMING
                        </span>
                      )}
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10.5px] font-bold border border-slate-200">
                          COMPLETED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="material-symbols-outlined text-[15px]">date_range</span>
                      <span>{p.startDate} → {p.endDate}</span>
                      {p.weeksRemaining > 0 && (
                        <>
                          <span>•</span>
                          <span>Còn {p.weeksRemaining} tuần</span>
                        </>
                      )}
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50/70 hover:bg-blue-100 text-[#004ac6] text-xs font-semibold border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                        <span>Chỉnh sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingPhase(p)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50/70 hover:bg-rose-100 text-rose-600 text-xs font-semibold border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                        <span>Xóa</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress and Milestone */}
                <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100 mb-3">
                  <div className="flex justify-between items-end mb-1.5 text-xs">
                    <div>
                      <span className="font-semibold text-slate-600">Tiến độ đợt: </span>
                      <strong className="text-[#004ac6] font-bold">{p.progressPercent}%</strong>
                    </div>
                    <span className="text-slate-500 text-[11.5px]">
                      Ghi chú: <strong className="text-slate-800">{p.targetMilestone}</strong>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#004ac6] rounded-full transition-all duration-500"
                      style={{ width: `${p.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Phase Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-3.5 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">add_circle</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">Thêm Đợt Thực Tập Mới</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePhase} className="space-y-3.5 p-5">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11.5px] font-semibold text-[#434655]">
                  Tên Đợt Thực Tập *
                </label>
                <input
                  type="text"
                  required
                  value={formPhaseName}
                  onChange={(e) => setFormPhaseName(e.target.value)}
                  placeholder="VD: Spring 2026, Summer 2026..."
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
                    Ngày Kết Thúc *
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
                  Mô Tả / Ghi Chú
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Mô tả đợt thực tập..."
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
                  {isSubmitting ? 'Đang lưu...' : 'Tạo Đợt Thực Tập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Phase Modal */}
      {editingPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-3.5 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[18px]">edit</span>
                <h3 className="text-sm font-bold text-[#0b1c30]">Cập Nhật Đợt Thực Tập #{editingPhase.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPhase(null)}
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
                  Tên Đợt Thực Tập *
                </label>
                <input
                  type="text"
                  required
                  value={formPhaseName}
                  onChange={(e) => setFormPhaseName(e.target.value)}
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
                    Ngày Kết Thúc *
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
                  Mô Tả / Ghi Chú
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-[#f1f5f9] pt-3">
                <button
                  type="button"
                  onClick={() => setEditingPhase(null)}
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
      {deletingPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0b1c30]">Xóa Đợt Thực Tập</h3>
                <p className="text-xs text-slate-500">Xác nhận gỡ bỏ kỳ thực tập</p>
              </div>
            </div>

            <p className="text-xs text-[#434655]">
              Bạn có chắc chắn muốn xóa đợt <strong>{deletingPhase.name}</strong>?
            </p>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setDeletingPhase(null)}
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
                {isSubmitting ? 'Đang xóa...' : 'Xóa Đợt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

