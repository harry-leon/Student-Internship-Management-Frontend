import React, { useState } from 'react';
import { InternshipPhase } from '../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  phases: InternshipPhase[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  phases,
}) => {
  const [reportType, setReportType] = useState<'executive' | 'gradebook' | 'placements'>('executive');
  const [selectedPhase, setSelectedPhase] = useState(phases[0]?.name || 'Fall 2026');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e2e8f0] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2563eb]">
              file_download
            </span>
            <h3 className="text-[17px] font-semibold text-[#0b1c30]">
              Export Operational Report
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

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#434655] mb-1.5">
              Select Phase / Term
            </label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none bg-white"
            >
              {phases.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#434655] mb-1.5">
              Report Template Format
            </label>
            <div className="space-y-2">
              {[
                {
                  id: 'executive',
                  title: 'Executive PDF Summary',
                  desc: 'Includes phase progress (68%), placement rate (94.2%), and advisor load.',
                  icon: 'picture_as_pdf',
                },
                {
                  id: 'gradebook',
                  title: 'Complete Excel Gradebook (.XLSX)',
                  desc: 'Individual student scores, midterm rubric marks, and faculty comments.',
                  icon: 'table_chart',
                },
                {
                  id: 'placements',
                  title: 'Enterprise Placements CSV',
                  desc: 'Raw company listings, contact advisors, and supervisor evaluations.',
                  icon: 'dataset',
                },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setReportType(opt.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    reportType === opt.id
                      ? 'border-[#2563eb] bg-[#eff4ff]'
                      : 'border-[#e2e8f0] hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] mt-0.5 ${
                      reportType === opt.id ? 'text-[#2563eb]' : 'text-[#64748b]'
                    }`}
                  >
                    {opt.icon}
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-[#0b1c30]">
                      {opt.title}
                    </div>
                    <div className="text-[11px] text-[#64748b] leading-normal">
                      {opt.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {downloadSuccess ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[13px] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-emerald-600">
                check_circle
              </span>
              <span>Report compiled & downloaded successfully!</span>
            </div>
          ) : null}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-[#64748b] hover:bg-[#f1f5f9] rounded-xl"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="px-4 py-2 text-[13px] font-medium bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                  <span>Compiling...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">
                    download
                  </span>
                  <span>Export File</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
