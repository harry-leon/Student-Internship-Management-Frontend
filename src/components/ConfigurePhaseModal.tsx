import React, { useState } from 'react';
import { InternshipPhase } from '../types';

interface ConfigurePhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: InternshipPhase;
  onUpdatePhase: (updated: InternshipPhase) => void;
}

export const ConfigurePhaseModal: React.FC<ConfigurePhaseModalProps> = ({
  isOpen,
  onClose,
  phase,
  onUpdatePhase,
}) => {
  const [name, setName] = useState(phase.name);
  const [targetMilestone, setTargetMilestone] = useState(phase.targetMilestone);
  const [progressPercent, setProgressPercent] = useState(phase.progressPercent);
  const [weeksRemaining, setWeeksRemaining] = useState(phase.weeksRemaining);
  const [status, setStatus] = useState(phase.status);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePhase({
      ...phase,
      name,
      targetMilestone,
      progressPercent: Number(progressPercent),
      weeksRemaining: Number(weeksRemaining),
      status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#e2e8f0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2563eb]">
              tune
            </span>
            <h3 className="text-[17px] font-semibold text-[#0b1c30]">
              Configure Phase Settings
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#434655] mb-1">
              Phase Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-[#434655] mb-1">
                Phase Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none bg-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="UPCOMING">UPCOMING</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#434655] mb-1">
                Weeks Remaining
              </label>
              <input
                type="number"
                min="0"
                max="52"
                value={weeksRemaining}
                onChange={(e) => setWeeksRemaining(Number(e.target.value))}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#434655] mb-1">
              Target Milestone
            </label>
            <input
              type="text"
              value={targetMilestone}
              onChange={(e) => setTargetMilestone(e.target.value)}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between text-[12px] font-medium text-[#434655] mb-1">
              <span>Overall Progress Completion</span>
              <span className="font-semibold text-[#004ac6]">{progressPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent}
              onChange={(e) => setProgressPercent(Number(e.target.value))}
              className="w-full accent-[#2563eb]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[#64748b] hover:bg-[#f1f5f9] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-[13px] font-medium bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
