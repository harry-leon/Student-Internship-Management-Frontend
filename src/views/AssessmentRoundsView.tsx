import React from 'react';
import { AssessmentRound } from '../types';

interface AssessmentRoundsViewProps {
  rounds: AssessmentRound[];
}

export const AssessmentRoundsView: React.FC<AssessmentRoundsViewProps> = ({
  rounds,
}) => {
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0b1c30] tracking-tight">
            Assessment Checkpoints & Rounds
          </h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Formal evaluation milestones, midterm submission deadlines, thesis defense sessions, and grading progress.
          </p>
        </div>
      </div>

      {/* Rounds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rounds.map((round) => {
          const isActive = round.status === 'ACTIVE';

          return (
            <div
              key={round.id}
              className="rounded-xl bg-white p-6 border border-[#e2e8f0] shadow-xs hover:border-[#cbd5e1] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-col">
                    <h2 className="text-[17px] font-semibold text-[#0b1c30]">
                      {round.name}
                    </h2>
                    <span className="text-[12px] text-[#64748b]">
                      {round.phase}
                    </span>
                  </div>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dce9ff] text-[#004ac6] text-[11px] font-bold border border-[#b4c5ff]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6] animate-ping"></span>
                      ACTIVE
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#64748b] text-[11px] font-bold border border-[#dce9ff]">
                      UPCOMING
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 py-3 border-y border-[#f1f5f9] text-[13px] my-3">
                  <div className="flex items-center gap-1.5 text-[#434655]">
                    <span className="material-symbols-outlined text-[16px] text-[#737686]">
                      schedule
                    </span>
                    <span>{round.dateRange}</span>
                  </div>
                  <span className="text-[#c3c6d7]">•</span>
                  <div className="font-mono text-[12px] font-medium text-[#004ac6]">
                    {round.timeRemainingText}
                  </div>
                </div>

                {/* Submissions stats */}
                <div className="my-3">
                  <div className="flex items-center justify-between text-[12px] mb-1.5">
                    <span className="text-[#64748b]">Evaluation Grading Progress</span>
                    <span className="font-semibold text-[#004ac6]">
                      {round.evaluatedSubmissions} / {round.totalSubmissions} ({round.completionRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#eff4ff] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563eb] rounded-full transition-all duration-700"
                      style={{ width: `${round.completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between">
                <span className="text-[12px] text-[#64748b]">
                  {round.totalSubmissions - round.evaluatedSubmissions} pending mentor reviews
                </span>
                <button
                  type="button"
                  className="text-[12px] font-semibold text-[#004ac6] hover:underline flex items-center gap-1"
                >
                  <span>Review Submissions</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
