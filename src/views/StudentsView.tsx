import React, { useState, useEffect } from 'react';
import { Role, Student } from '../types';
import { studentService } from '../api/services';
import { mapStudentFromDTO } from '../api/mappers';
import { canManageSystemData } from '../auth/roleAccess';

interface StudentsViewProps {
  currentRole: Role;
  onOpenAddStudent: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  currentRole,
  onOpenAddStudent,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const canManage = canManageSystemData(currentRole);

  useEffect(() => {
    setIsLoading(true);
    studentService.getAll()
      .then(res => {
        let arr = [];
        if (Array.isArray(res)) arr = res;
        else if (typeof res === 'object' && Array.isArray((res as any).content)) arr = (res as any).content;
        else if (typeof res === 'object' && Array.isArray((res as any).data)) arr = (res as any).data;

        setStudents(arr.map(mapStudentFromDTO));
      })
      .catch(err => console.error('Error fetching students:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.company.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'ALL' || s.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="flex w-full flex-col animate-in fade-in duration-200">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#0b1c30]">
            Student Interns Pool
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[#64748b]">
            Directory of enrolled interns, internship academic progression, and enterprise placements.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={onOpenAddStudent}
            className="inline-flex h-10 items-center gap-2 self-start rounded-xl bg-[#004ac6] px-4 text-[12.5px] font-medium text-white shadow-xs transition-all hover:bg-[#003ea8] lg:self-auto"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Enroll New Student</span>
          </button>
        )}
      </div>

      <div className="mb-5 grid gap-3 rounded-2xl border border-[#dbe5f3] bg-white p-4 shadow-xs lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="flex items-center gap-2 rounded-xl border border-[#dbe5f3] bg-[#f8f9ff] px-3 py-2.5">
          <span className="material-symbols-outlined text-[18px] text-[#64748b]">
            search
          </span>
          <input
            type="text"
            placeholder="Search student by name, student code, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none placeholder-[#94a3b8]"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-[42px] rounded-xl border border-[#dbe5f3] bg-white px-3 text-[13px] text-[#0b1c30] outline-none"
        >
          <option value="ALL">All Departments</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Information Systems">Information Systems</option>
          <option value="Computer Science">Computer Science</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-indigo-600">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="col-span-full rounded-2xl border border-[#e2e8f0] bg-white p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <h3 className="text-base font-semibold text-[#0b1c30]">Chưa có dữ liệu sinh viên từ API</h3>
          <p className="mt-1 mb-4 text-xs text-[#64748b]">
            Cơ sở dữ liệu backend hiện tại chưa có sinh viên nào hoặc kết quả tìm kiếm không phù hợp.
          </p>
          {canManage && (
            <button
              type="button"
              onClick={onOpenAddStudent}
              className="rounded-xl bg-[#004ac6] px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-[#003ea8]"
            >
              + Thêm Sinh Viên Mới vào API
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="rounded-lg border border-[#dbe5f3] bg-white p-3 shadow-xs transition-all hover:border-[#cbd5e1] hover:shadow-md"
            >
              <div className="flex items-start gap-2">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="h-10 w-10 rounded-lg border border-[#e2e8f0] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[14px] font-semibold text-[#0b1c30]">
                    {student.name}
                  </h3>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1">
                    <span className="rounded-md border border-[#dce9ff] bg-[#eff4ff] px-1.5 py-0.5 font-mono text-[9.5px] font-medium text-[#004ac6]">
                      {student.code}
                    </span>
                    <span className="truncate text-[10px] text-[#64748b]">{student.department}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 grid gap-1 rounded-lg border border-[#eef2f7] bg-[#fbfcff] p-2 text-[10.5px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#64748b]">Host Company</span>
                  <span className="max-w-[58%] truncate font-medium text-[#0b1c30]">{student.company}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#64748b]">Advisor</span>
                  <span className="max-w-[58%] truncate font-medium text-[#0b1c30]">{student.mentor}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#64748b]">Phase</span>
                  <span className="max-w-[58%] truncate font-medium text-[#0b1c30]">{student.phase}</span>
                </div>
              </div>

              <div className="mt-2.5">
                <div className="mb-1 flex items-center justify-between text-[10px] font-medium text-[#64748b]">
                  <span>Completion</span>
                  <span className="font-semibold text-[#004ac6]">{student.progress}%</span>
                </div>
                <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[#eff4ff]">
                  <div
                    className="h-full rounded-full bg-[#2563eb] transition-all"
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between gap-2 text-[10.5px]">
                  <span className="text-[#64748b]">
                    Score: <strong className="text-[#0b1c30]">{student.score ?? 0}/10</strong>
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#dce9ff] bg-[#eff4ff] px-1.5 py-0.5 text-[9px] font-bold text-[#004ac6]">
                    {student.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



