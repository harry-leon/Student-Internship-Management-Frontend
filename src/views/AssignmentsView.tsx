import React, { useState, useEffect } from 'react';
import { Assignment, Role } from '../types';
import { assignmentService } from '../api/services';
import { mapAssignmentFromDTO } from '../api/mappers';
import { canManageSystemData } from '../auth/roleAccess';

interface AssignmentsViewProps {
  currentRole: Role;
  onSelectAssignment: (assignment: Assignment) => void;
  onOpenQuickAction: () => void;
}

export const AssignmentsView: React.FC<AssignmentsViewProps> = ({
  currentRole,
  onSelectAssignment,
  onOpenQuickAction,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');
  const canManage = canManageSystemData(currentRole);

  useEffect(() => {
    setIsLoading(true);
    assignmentService.getAll()
      .then(res => {
        let arr = [];
        if (Array.isArray(res)) arr = res;
        else if (typeof res === 'object' && Array.isArray((res as any).content)) arr = (res as any).content;
        else if (typeof res === 'object' && Array.isArray((res as any).data)) arr = (res as any).data;

        setAssignments(arr.map(mapAssignmentFromDTO));
      })
      .catch(err => console.error('Error fetching assignments:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = assignments.filter((asg) => {
    const matchSearch =
      asg.studentName.toLowerCase().includes(search.toLowerCase()) ||
      asg.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      asg.mentorName.toLowerCase().includes(search.toLowerCase()) ||
      (asg.companyName && asg.companyName.toLowerCase().includes(search.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || asg.status === statusFilter;
    const matchPhase = phaseFilter === 'ALL' || asg.phase === phaseFilter;

    return matchSearch && matchStatus && matchPhase;
  });

  return (
    <div className="flex w-full flex-col animate-in fade-in duration-200">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#0b1c30]">
            Assignments Directory
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[#64748b]">
            Manage student-to-mentor pairings, enterprise host placements, and evaluation statuses.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={onOpenQuickAction}
            className="inline-flex h-10 items-center gap-2 self-start rounded-xl bg-[#004ac6] px-4 text-[12.5px] font-medium text-white shadow-xs transition-all hover:bg-[#003ea8] lg:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Assign Student</span>
          </button>
        )}
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-[#dbe5f3] bg-white p-4 shadow-xs lg:grid-cols-[minmax(0,1fr)_180px_180px]">
        <div className="flex items-center gap-2 rounded-xl border border-[#dbe5f3] bg-[#f8f9ff] px-3 py-2.5">
          <span className="material-symbols-outlined text-[18px] text-[#64748b]">
            search
          </span>
          <input
            type="text"
            placeholder="Search student name, student ID, mentor, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none placeholder-[#94a3b8]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[#94a3b8] hover:text-[#0b1c30]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          className="h-[42px] rounded-xl border border-[#dbe5f3] bg-white px-3 text-[13px] text-[#0b1c30] outline-none"
        >
          <option value="ALL">All Phases</option>
          <option value="Fall 2026">Fall 2026</option>
          <option value="Spring 2027">Spring 2027</option>
          <option value="Summer 2026">Summer 2026</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-[42px] rounded-xl border border-[#dbe5f3] bg-white px-3 text-[13px] text-[#0b1c30] outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="IN PROGRESS">In Progress</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="rounded-2xl border border-[#dbe5f3] bg-white p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[12px] text-[#64748b]">
            Showing <span className="font-semibold text-[#0b1c30]">{filtered.length}</span> assignments
          </div>
        </div>

        <div className="no-scrollbar overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#dce9ff] bg-[#eff4ff] text-[10.5px] font-semibold uppercase tracking-wider text-[#434655]">
                <th className="rounded-l-lg px-3 py-2.5">Student</th>
                <th className="px-3 py-2.5">Faculty Advisor</th>
                <th className="px-3 py-2.5">Enterprise Host</th>
                <th className="px-3 py-2.5">Phase</th>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="rounded-r-lg px-2.5 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[12px] text-[#0b1c30]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-indigo-600">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b]">
                    Không có phân công nào khớp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onSelectAssignment(row)}
                    className="group cursor-pointer transition-colors hover:bg-[#eff4ff]/60"
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          className="h-8 w-8 rounded-full border border-[#e2e8f0] object-cover shadow-xs"
                          src={row.studentAvatar}
                          alt={row.studentName}
                        />
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-[#0b1c30] transition-colors group-hover:text-[#004ac6]">
                            {row.studentName}
                          </span>
                          <span className="font-mono text-[11px] text-[#434655]">
                            {row.studentCode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-[#0b1c30]">{row.mentorName}</div>
                      <div className="text-[10.5px] text-[#64748b]">{row.mentorDept}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[12px] font-medium text-[#0b1c30]">
                        {row.companyName || 'Campus Lab'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[#434655]">{row.phase}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-[#434655]">{row.date}</td>
                    <td className="px-3 py-2.5">
                      {row.status === 'IN PROGRESS' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#b4c5ff] bg-[#dce9ff] px-2 py-0.5 text-[10px] font-bold text-[#004ac6]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#004ac6]"></span>
                          IN PROGRESS
                        </span>
                      )}
                      {row.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#d2bbff] bg-[#eaddff] px-2 py-0.5 text-[10px] font-bold text-[#5a00c6]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#712ae2]"></span>
                          PENDING
                        </span>
                      )}
                      {row.status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#93ccff] bg-[#cce5ff] px-2 py-0.5 text-[10px] font-bold text-[#004b73]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#005a89]"></span>
                          COMPLETED
                        </span>
                      )}
                      {row.status === 'CANCELLED' && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#ffb4ab] bg-[#ffdad6] px-2 py-0.5 text-[10px] font-bold text-[#ba1a1a]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#ba1a1a]"></span>
                          CANCELLED
                        </span>
                      )}
                    </td>
                    <td className="px-2.5 py-2.5 text-right">
                      <button
                        type="button"
                        className="rounded-lg p-1 text-[#737686] transition-colors hover:bg-[#e5eeff] hover:text-[#0b1c30]"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          more_horiz
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
