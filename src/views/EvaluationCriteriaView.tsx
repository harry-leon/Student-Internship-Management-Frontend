import React, { useState } from 'react';
import { EvaluationCriterion, Role } from '../types';
import { canManageSystemData } from '../auth/roleAccess';

interface EvaluationCriteriaViewProps {
  criteria: EvaluationCriterion[];
  currentRole: Role;
  onAddCriterion: (crit: EvaluationCriterion) => void;
}

export const EvaluationCriteriaView: React.FC<EvaluationCriteriaViewProps> = ({
  criteria,
  currentRole,
  onAddCriterion,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Engineering & Craft');
  const [weight, setWeight] = useState(25);
  const [description, setDescription] = useState('');
  const canManage = canManageSystemData(currentRole);

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCriterion({
      id: `crit-${Date.now()}`,
      name,
      category,
      weight: Number(weight),
      maxScore: 10,
      description: description || 'Evaluation criteria defined by university internship committee.',
    });

    setName('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0b1c30] tracking-tight">
            Evaluation Criteria & Rubrics
          </h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Institutional rubrics, grading criteria weights, and academic performance indicators.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 rounded-xl bg-[#004ac6] text-white text-[13px] font-medium shadow-xs hover:bg-[#003ea8] transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Grading Rubric</span>
          </button>
        )}
      </div>

      {/* Weight Summary Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-[14px] font-semibold text-[#0b1c30]">
            Grading Weight Distribution
          </div>
          <div className="text-[12px] text-[#64748b]">
            Total weighted score across all assessment modules must sum to exactly 100%.
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-[#64748b] uppercase tracking-wider block">
              Cumulative Weight
            </span>
            <span
              className={`text-[20px] font-bold ${
                totalWeight === 100 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {totalWeight}% / 100%
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#004ac6]">
            <span className="material-symbols-outlined text-[20px]">balance</span>
          </div>
        </div>
      </div>

      {/* Criteria Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {criteria.map((crit) => (
          <div
            key={crit.id}
            className="rounded-xl bg-white p-6 border border-[#e2e8f0] shadow-xs hover:border-[#cbd5e1] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[11px] font-semibold text-[#004ac6] uppercase tracking-wider bg-[#eff4ff] px-2 py-0.5 rounded border border-[#dce9ff]">
                    {crit.category}
                  </span>
                  <h3 className="text-[16px] font-semibold text-[#0b1c30] mt-2">
                    {crit.name}
                  </h3>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[20px] font-bold text-[#004ac6]">
                    {crit.weight}%
                  </span>
                  <span className="text-[11px] text-[#64748b]">weight</span>
                </div>
              </div>

              <p className="text-[13px] text-[#434655] leading-relaxed mb-4">
                {crit.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-[12px]">
              <span className="text-[#64748b]">
                Scale: <strong className="text-[#0b1c30]">0 – {crit.maxScore} pts</strong>
              </span>
              <span className="text-[12px] font-medium text-[#004ac6]">
                Standardized Rubric
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Criterion Modal */}
      {canManage && showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e2e8f0] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h3 className="text-[16px] font-semibold text-[#0b1c30]">
                Add Evaluation Criterion
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#434655] mb-1">
                  Criterion Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Industry Mentor Review"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#434655] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] outline-none bg-white"
                  >
                    <option value="Engineering & Craft">Engineering & Craft</option>
                    <option value="Work Ethics">Work Ethics</option>
                    <option value="Project Outcome">Project Outcome</option>
                    <option value="Academic Defense">Academic Defense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#434655] mb-1">
                    Weight Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#434655] mb-1">
                  Description & Rubric Guidelines
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain assessment expectations and grading benchmarks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[13px] text-[#64748b] hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-[13px] font-medium bg-[#2563eb] text-white rounded-xl shadow-xs"
                >
                  Save Criterion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
