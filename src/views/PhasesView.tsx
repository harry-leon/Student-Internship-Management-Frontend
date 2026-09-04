import React from 'react';
import { InternshipPhase, Role } from '../types';
import { canManageSystemData } from '../auth/roleAccess';

interface PhasesViewProps {
  phases: InternshipPhase[];
  currentRole: Role;
  onConfigurePhase: (phase: InternshipPhase) => void;
}

export const PhasesView: React.FC<PhasesViewProps> = ({
  phases,
  currentRole,
  onConfigurePhase,
}) => {
  const canManage = canManageSystemData(currentRole);

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0b1c30] tracking-tight">
            Internship Operational Phases
          </h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Academic terms, semester scheduling, progress milestones, and capacity allocations.
          </p>
        </div>
      </div>

      {/* Phase Cards List */}
      <div className="space-y-5">
        {phases.map((p) => {
          const isActive = p.status === 'ACTIVE';
          const isUpcoming = p.status === 'UPCOMING';
          const isCompleted = p.status === 'COMPLETED';

          return (
            <div
              key={p.id}
              className="rounded-xl bg-white p-6 border border-[#e2e8f0] shadow-xs hover:border-[#cbd5e1] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-[18px] font-semibold text-[#0b1c30]">
                      {p.name}
                    </h2>
                    {isActive && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#004ac6] text-[11px] font-bold border border-[#dce9ff]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] animate-ping"></span>
                        ACTIVE
                      </span>
                    )}
                    {isUpcoming && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#eaddff] text-[#5a00c6] text-[11px] font-bold border border-[#d2bbff]">
                        UPCOMING
                      </span>
                    )}
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#cce5ff] text-[#004b73] text-[11px] font-bold border border-[#93ccff]">
                        COMPLETED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#64748b]">
                    <span className="material-symbols-outlined text-[16px]">
                      date_range
                    </span>
                    <span>
                      {p.startDate} → {p.endDate}
                    </span>
                    {p.weeksRemaining > 0 && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{p.weeksRemaining} weeks remaining</span>
                      </>
                    )}
                  </div>
                </div>

                {canManage && (
                  <button
                    type="button"
                    onClick={() => onConfigurePhase(p)}
                    className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-[13px] font-medium border border-[#dce9ff] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Configure Phase</span>
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                  </button>
                )}
              </div>

              {/* Progress and Milestone */}
              <div className="bg-[#eff4ff] p-4 rounded-xl mb-4 border border-[#dce9ff]/60">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase text-[#434655] tracking-wider">
                      Phase Progress
                    </span>
                    <span className="text-[18px] font-semibold text-[#004ac6]">
                      {p.progressPercent}%
                    </span>
                  </div>
                  <span className="text-[12px] text-[#434655]">
                    Target milestone: <strong className="text-[#0b1c30]">{p.targetMilestone}</strong>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#dce9ff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#2563eb] rounded-full transition-all duration-700"
                    style={{ width: `${p.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Statistics row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-[#f8f9ff] border border-[#e2e8f0] flex items-center gap-3">
                  <span className="material-symbols-outlined text-[22px] text-[#004ac6]">
                    groups
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-[#0b1c30]">
                      {p.totalStudents} Students
                    </div>
                    <div className="text-[11px] text-[#64748b]">Total enrolled interns</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#f8f9ff] border border-[#e2e8f0] flex items-center gap-3">
                  <span className="material-symbols-outlined text-[22px] text-[#712ae2]">
                    school
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-[#0b1c30]">
                      {p.totalMentors} Mentors
                    </div>
                    <div className="text-[11px] text-[#64748b]">Supervising advisors</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#f8f9ff] border border-[#e2e8f0] flex items-center gap-3">
                  <span className="material-symbols-outlined text-[22px] text-[#005a89]">
                    event_repeat
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-[#0b1c30]">
                      {p.scheduledRounds} Rounds
                    </div>
                    <div className="text-[11px] text-[#64748b]">Assessment checkpoints</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
