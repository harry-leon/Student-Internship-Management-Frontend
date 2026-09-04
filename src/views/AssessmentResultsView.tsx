import React from 'react';
import { Student } from '../types';

interface AssessmentResultsViewProps {
  students: Student[];
}

export const AssessmentResultsView: React.FC<AssessmentResultsViewProps> = ({
  students,
}) => {
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0b1c30] tracking-tight">
            Assessment Results & Analytics
          </h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Academic internship grade distribution, rubric performance, and final competency outcomes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#64748b]">Overall Pass Rate:</span>
          <span className="text-[13px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            98.8% Passed
          </span>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-[#64748b] tracking-wider mb-2">
            Average Intern GPA
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-[#0b1c30]">8.72</span>
            <span className="text-[12px] text-[#64748b]">/ 10.0 scale</span>
          </div>
          <div className="text-[12px] text-emerald-600 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+0.35 vs previous term</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-[#64748b] tracking-wider mb-2">
            High Distinction (Grade A)
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-[#004ac6]">64.2%</span>
            <span className="text-[12px] text-[#64748b]">of cohorts</span>
          </div>
          <div className="text-[12px] text-[#64748b] mt-1">
            Exceeding enterprise technical rubrics
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-[#64748b] tracking-wider mb-2">
            Placement Conversion Rate
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-[#712ae2]">78.5%</span>
            <span className="text-[12px] text-[#64748b]">full-time offers</span>
          </div>
          <div className="text-[12px] text-[#64748b] mt-1">
            Direct host enterprise hires
          </div>
        </div>
      </div>

      {/* Student Scorecards Table */}
      <div className="bg-white p-6 rounded-xl border border-[#e2e8f0] shadow-xs">
        <h3 className="text-[17px] font-semibold text-[#0b1c30] mb-4">
          Student Evaluation Scorecards
        </h3>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] text-[11px] font-semibold uppercase text-[#434655] tracking-wider border-b border-[#dce9ff]">
                <th className="py-2.5 px-4 rounded-l-lg">Student</th>
                <th className="py-2.5 px-4">Advisor</th>
                <th className="py-2.5 px-4">Enterprise</th>
                <th className="py-2.5 px-4">Technical (30%)</th>
                <th className="py-2.5 px-4">Workplace (20%)</th>
                <th className="py-2.5 px-4">Final Score</th>
                <th className="py-2.5 px-4 rounded-r-lg">Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px] text-[#0b1c30]">
              {students.map((s) => {
                const score = s.score || 8.5;
                const isHonors = score >= 9.0;

                return (
                  <tr key={s.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#e2e8f0]"
                        />
                        <div>
                          <div className="font-semibold text-[#0b1c30]">{s.name}</div>
                          <div className="text-[11px] font-mono text-[#64748b]">{s.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#434655]">{s.mentor}</td>
                    <td className="py-3 px-4 text-[#434655]">{s.company}</td>
                    <td className="py-3 px-4 font-mono font-medium text-[#0b1c30]">
                      {(score * 0.95).toFixed(1)} / 10
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[#0b1c30]">
                      {(score * 1.02 > 10 ? 10 : score * 1.02).toFixed(1)} / 10
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#004ac6]">
                      {score.toFixed(1)}
                    </td>
                    <td className="py-3 px-4">
                      {isHonors ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#eaddff] text-[#5a00c6] border border-[#d2bbff]">
                          HONORS
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#cce5ff] text-[#004b73] border border-[#93ccff]">
                          EXCELLENT
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
