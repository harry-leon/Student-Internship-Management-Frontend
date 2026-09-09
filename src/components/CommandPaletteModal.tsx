import React, { useState, useEffect } from 'react';
import { NavPage, Student, Mentor, InternshipPhase, Role } from '../types';
import { canAccessPage } from '../auth/roleAccess';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: Role;
  onNavigate: (page: NavPage) => void;
  students: Student[];
  mentors: Mentor[];
  phases: InternshipPhase[];
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onNavigate,
  students,
  mentors,
  phases,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.code.toLowerCase().includes(query.toLowerCase()) ||
      s.company.toLowerCase().includes(query.toLowerCase())
  );

  const filteredMentors = mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.department.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPhases = phases.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const navItems = [
    { id: 'dashboard' as NavPage, label: 'Dashboard', icon: 'grid_view' },
    { id: 'assignments' as NavPage, label: 'Assignments Directory', icon: 'assignment' },
    { id: 'students' as NavPage, label: 'Enrolled Students', icon: 'school' },
    { id: 'mentors' as NavPage, label: 'Mentors Faculty Pool', icon: 'supervisor_account' },
    { id: 'internship-phases' as NavPage, label: 'Internship Phases', icon: 'timeline' },
    { id: 'assessment-rounds' as NavPage, label: 'Upcoming Rounds', icon: 'event_repeat' },
    { id: 'evaluation-criteria' as NavPage, label: 'Evaluation Rubrics', icon: 'rule' },
    { id: 'assessment-results' as NavPage, label: 'Assessment Results', icon: 'insights' },
  ].filter((item) => canAccessPage(currentRole, item.id));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#e2e8f0] overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#e2e8f0]">
          <span className="material-symbols-outlined text-[22px] text-[#2563eb]">
            search
          </span>
          <input
            type="text"
            placeholder="Search students, mentors, phases, or shortcuts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 text-[15px] outline-none text-[#0b1c30] placeholder-[#94a3b8]"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Search Results / Navigation shortcuts */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-[#f1f5f9] no-scrollbar">
          {/* Quick Navigation Pages */}
          <div className="py-2">
            <span className="px-3 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-1.5">
              Navigation Pages
            </span>
            <div className="grid grid-cols-2 gap-1 px-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-[#434655] hover:bg-[#eff4ff] hover:text-[#004ac6] transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#64748b]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Students Match */}
          {canAccessPage(currentRole, 'students') && filteredStudents.length > 0 && (
            <div className="py-2">
              <span className="px-3 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-1.5">
                Students ({filteredStudents.length})
              </span>
              {filteredStudents.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    onNavigate('students');
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#eff4ff] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-[13px] font-medium text-[#0b1c30]">
                        {s.name}{' '}
                        <span className="text-[12px] font-mono text-[#64748b]">
                          ({s.code})
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748b]">
                        {s.company} • {s.mentor}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-[#e5eeff] text-[#004ac6]">
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Mentors Match */}
          {canAccessPage(currentRole, 'mentors') && filteredMentors.length > 0 && (
            <div className="py-2">
              <span className="px-3 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-1.5">
                Mentors ({filteredMentors.length})
              </span>
              {filteredMentors.slice(0, 3).map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    onNavigate('mentors');
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#eff4ff] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-[13px] font-medium text-[#0b1c30]">
                        {m.name}
                      </div>
                      <div className="text-[11px] text-[#64748b]">
                        {m.department} • {m.activeStudents} active students
                      </div>
                    </div>
                  </div>
                  <span className="text-[12px] text-[#64748b]">View Profile →</span>
                </div>
              ))}
            </div>
          )}

          {/* Phases Match */}
          {canAccessPage(currentRole, 'internship-phases') && filteredPhases.length > 0 && (
            <div className="py-2">
              <span className="px-3 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider block mb-1.5">
                Phases ({filteredPhases.length})
              </span>
              {filteredPhases.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    onNavigate('internship-phases');
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#eff4ff] cursor-pointer transition-colors"
                >
                  <div className="text-[13px] font-medium text-[#0b1c30]">
                    {p.name}
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#e5eeff] text-[#004ac6]">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#f8f9ff] border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">
          <span>Tip: Press ESC or click outside to dismiss</span>
          <span>TSUBASA+ Internship Engine</span>
        </div>
      </div>
    </div>
  );
};
