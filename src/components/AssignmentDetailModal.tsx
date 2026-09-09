import React, { useState } from 'react';
import { Assignment, AssignmentStatus, Role } from '../types';
import { canUpdateAssignmentStatus } from '../auth/roleAccess';

interface AssignmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  currentRole: Role;
  onUpdateStatus: (id: string, status: AssignmentStatus) => void;
  onDeleteAssignment?: (id: string) => void;
}

export const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  isOpen,
  onClose,
  assignment,
  currentRole,
  onUpdateStatus,
  onDeleteAssignment,
}) => {
  if (!isOpen || !assignment) return null;
  const canUpdateStatus = canUpdateAssignmentStatus(currentRole);

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case 'IN PROGRESS':
        return 'bg-[#dce9ff] text-[#004ac6] border-[#b4c5ff]';
      case 'PENDING':
        return 'bg-[#eaddff] text-[#5a00c6] border-[#d2bbff]';
      case 'COMPLETED':
        return 'bg-[#cce5ff] text-[#004b73] border-[#93ccff]';
      case 'CANCELLED':
        return 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffb4ab]';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#e2e8f0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-[#2563eb]">
              assignment_ind
            </span>
            <h3 className="text-[17px] font-semibold text-[#0b1c30]">
              Internship Assignment Record
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Student Profile Snapshot */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
            <img
              src={assignment.studentAvatar}
              alt={assignment.studentName}
              className="w-14 h-14 rounded-full object-cover shadow-sm border-2 border-white"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-[16px] font-semibold text-[#0b1c30] truncate">
                  {assignment.studentName}
                </h4>
                <span className="text-[12px] font-mono font-medium px-2 py-0.5 rounded bg-white text-[#004ac6] border border-[#dce9ff]">
                  {assignment.studentCode}
                </span>
              </div>
              <div className="text-[12px] text-[#64748b] mt-0.5">
                Phase: <span className="font-medium text-[#0b1c30]">{assignment.phase}</span> • Registered on {assignment.date}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                  assignment.status
                )}`}
              >
                {assignment.status}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <div className="p-3.5 rounded-xl border border-[#e2e8f0]">
              <div className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">
                Faculty Advisor
              </div>
              <div className="font-semibold text-[#0b1c30]">
                {assignment.mentorName}
              </div>
              <div className="text-[12px] text-[#64748b]">
                {assignment.mentorDept}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#e2e8f0]">
              <div className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">
                Host Enterprise
              </div>
              <div className="font-semibold text-[#0b1c30]">
                {assignment.companyName || 'Not Assigned'}
              </div>
              <div className="text-[12px] text-[#64748b]">
                Verified Partner Organization
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#e2e8f0]">
            <div className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">
              Capstone Project / Topic
            </div>
            <div className="text-[13px] text-[#0b1c30] font-medium">
              {assignment.projectTopic || 'Software Development & Production Deployment'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc]">
            <div className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">
              Latest Submission Record
            </div>
            {assignment.latestSubmissionType ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#eff4ff] px-2 py-1 text-[11px] font-semibold text-[#004ac6]">
                    <span className="material-symbols-outlined text-[14px]">
                      {assignment.latestSubmissionType === 'GITHUB' ? 'code' : 'folder_zip'}
                    </span>
                    {assignment.latestSubmissionType}
                  </span>
                  <span className="text-[12px] text-[#64748b]">
                    {assignment.latestSubmittedAt ? new Date(assignment.latestSubmittedAt).toLocaleString() : ''}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Active Submission
                </span>
              </div>
            ) : (
              <div className="text-[12px] text-[#94a3b8]">
                Chưa có bài nộp nào cho phân công này.
              </div>
            )}
          </div>

          {/* Quick Status Toggles */}
          {canUpdateStatus && (
            <div>
              <label className="block text-[12px] font-medium text-[#434655] mb-2">
                Update Assignment Status
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['IN PROGRESS', 'PENDING', 'COMPLETED', 'CANCELLED'] as AssignmentStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onUpdateStatus(assignment.id, st)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all border ${
                        assignment.status === st
                          ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-sm'
                          : 'bg-white text-[#434655] border-[#e2e8f0] hover:bg-[#eff4ff]'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            {currentRole === 'Admin' && onDeleteAssignment ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Bạn có chắc chắn muốn xóa/hủy phân công của sinh viên ${assignment.studentName}?`)) {
                    onDeleteAssignment(assignment.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">delete</span>
                <span>Xóa phân công</span>
              </button>
            ) : <div />}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
