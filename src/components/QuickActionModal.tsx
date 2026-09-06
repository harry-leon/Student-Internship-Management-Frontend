import React, { useState } from 'react';
import { Assignment, InternshipPhase, Mentor, Student } from '../types';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  phases: InternshipPhase[];
  mentors: Mentor[];
  onAddAssignment: (assignment: Assignment) => void;
  onAddStudent: (student: Student) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  phases,
  mentors,
  onAddAssignment,
  onAddStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'assignment' | 'student'>('assignment');

  // Assignment form state
  const [studentName, setStudentName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(mentors[0]?.name || '');
  const [selectedPhase, setSelectedPhase] = useState(phases[0]?.term || phases[0]?.name || '');
  const [companyName, setCompanyName] = useState('');
  const [projectTopic, setProjectTopic] = useState('');

  // Student form state
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentCode, setNewStudentCode] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentDept, setNewStudentDept] = useState('Software Engineering');

  if (!isOpen) return null;

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentCode.trim()) return;

    const mentorObj = mentors.find((m) => m.name === selectedMentor) || mentors[0];

    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      studentName,
      studentCode,
      studentAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=2563EB&color=fff`,
      mentorName: mentorObj?.name || 'Chưa phân công',
      mentorDept: mentorObj?.department || '',
      phase: selectedPhase || 'Chưa phân đợt',
      date: new Date().toLocaleDateString('vi-VN'),
      status: 'IN PROGRESS',
      companyName: companyName || 'Chưa phân công',
      projectTopic: projectTopic || 'Chưa phân công',
    };

    onAddAssignment(newAsg);
    onClose();
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentCode.trim()) return;

    const newStd: Student = {
      id: `std-${Date.now()}`,
      name: newStudentName,
      code: newStudentCode,
      email: newStudentEmail || `${newStudentCode.toLowerCase()}@university.edu.vn`,
      department: newStudentDept,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newStudentName)}&background=0D8ABC&color=fff`,
      phase: selectedPhase || 'Chưa phân đợt',
      mentor: selectedMentor || 'Chưa phân công',
      company: companyName || 'Chưa phân công',
      status: 'IN PROGRESS',
      progress: 0,
    };

    onAddStudent(newStd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-[#e2e8f0] dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#2563eb] dark:text-blue-400">
              bolt
            </span>
            <h3 className="text-[17px] font-semibold text-[#0b1c30] dark:text-slate-100">
              Quick Action
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex bg-[#eff4ff] p-1 rounded-xl border border-[#dce9ff]">
            <button
              type="button"
              onClick={() => setActiveTab('assignment')}
              className={`flex-1 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'assignment'
                  ? 'bg-white text-[#004ac6] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                  : 'text-[#64748b] hover:text-[#0b1c30]'
              }`}
            >
              New Internship Assignment
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`flex-1 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === 'student'
                  ? 'bg-white text-[#004ac6] shadow-[0_1px_2px_rgba(0,0,0,0.06)]'
                  : 'text-[#64748b] hover:text-[#0b1c30]'
              }`}
            >
              Enroll Student Intern
            </button>
          </div>
        </div>

        {/* Forms */}
        {activeTab === 'assignment' ? (
          <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#434655] mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vo Van Cuong"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#434655] mb-1">
                  Student ID / Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SE184512"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#434655] mb-1">
                  Supervising Mentor
                </label>
                <select
                  value={selectedMentor}
                  onChange={(e) => setSelectedMentor(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none bg-white"
                >
                  {mentors.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#434655] mb-1">
                  Internship Phase
                </label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none bg-white"
                >
                  {phases.map((p) => (
                    <option key={p.id} value={p.term}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#434655] mb-1">
                Enterprise / Host Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Viettel Telecom / FPT Software"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#434655] mb-1">
                Project / Internship Topic
              </label>
              <input
                type="text"
                placeholder="e.g. AI-driven Supply Chain Automation"
                value={projectTopic}
                onChange={(e) => setProjectTopic(e.target.value)}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none"
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
                <span className="material-symbols-outlined text-[16px]">check</span>
                <span>Confirm Assignment</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleCreateStudent} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#434655] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bui Hoang Yen"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#434655] mb-1">
                  Student Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI180899"
                  value={newStudentCode}
                  onChange={(e) => setNewStudentCode(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-[#434655] mb-1">
                  Academic Department
                </label>
                <select
                  value={newStudentDept}
                  onChange={(e) => setNewStudentDept(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none bg-white"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Information Systems">Information Systems</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#434655] mb-1">
                  Academic Email
                </label>
                <input
                  type="email"
                  placeholder="student@university.edu.vn"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#e2e8f0] focus:border-[#2563eb] outline-none"
                />
              </div>
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
                <span className="material-symbols-outlined text-[16px]">person_add</span>
                <span>Enroll Student</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
