import React, { useState, useEffect } from 'react';
import { Mentor } from '../types';
import { mentorService } from '../api/services';
import { mapMentorFromDTO } from '../api/mappers';

interface MentorsViewProps {}

export const MentorsView: React.FC<MentorsViewProps> = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setIsLoading(true);
    mentorService.getAll()
      .then(res => {
        let arr = [];
        if (Array.isArray(res)) arr = res;
        else if (typeof res === 'object' && Array.isArray((res as any).content)) arr = (res as any).content;
        else if (typeof res === 'object' && Array.isArray((res as any).data)) arr = (res as any).data;

        setMentors(arr.map(mapMentorFromDTO));
      })
      .catch(err => console.error('Error fetching mentors:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = mentors.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.department.toLowerCase().includes(search.toLowerCase()) ||
      m.specialization.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex w-full flex-col animate-in fade-in duration-200">
      <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#0b1c30]">
            Faculty & Mentors Pool
          </h1>
          <p className="mt-0.5 text-[12.5px] text-[#64748b]">
            Supervising professors, faculty advisors, active mentoring capacities, and student allocations.
          </p>
        </div>
        <div className="self-start rounded-lg border border-[#dce9ff] bg-[#eff4ff] px-3 py-1.5 text-[12px] font-medium text-[#004ac6] lg:self-auto">
          Total Faculty Pool: {mentors.length}
        </div>
      </div>

      <div className="mb-5 max-w-md rounded-2xl border border-[#dbe5f3] bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2 rounded-xl border border-[#dbe5f3] bg-[#f8f9ff] px-3 py-2">
          <span className="material-symbols-outlined text-[18px] text-[#64748b]">
            search
          </span>
          <input
            type="text"
            placeholder="Search mentor by name, department, specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none placeholder-[#94a3b8]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-indigo-600">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <span className="material-symbols-outlined text-[24px]">supervisor_account</span>
          </div>
          <h3 className="text-base font-semibold text-[#0b1c30]">Chưa có dữ liệu Mentor từ API</h3>
          <p className="mt-1 text-xs text-[#64748b]">
            Cơ sở dữ liệu backend hiện tại chưa ghi nhận danh sách giảng viên hướng dẫn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((mentor) => {
            const loadPercent = Math.round((mentor.activeStudents / mentor.maxCapacity) * 100);
            const isNearCapacity = loadPercent >= 90;

            return (
              <div
                key={mentor.id}
                className="flex flex-col justify-between rounded-2xl border border-[#dbe5f3] bg-white p-4 shadow-xs transition-all hover:shadow-md"
              >
                <div>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="h-12 w-12 rounded-xl border border-[#e2e8f0] object-cover shadow-xs"
                      />
                      <div>
                        <h3 className="text-[15px] font-semibold text-[#0b1c30]">
                          {mentor.name}
                        </h3>
                        <div className="text-[11.5px] font-medium text-[#004ac6]">
                          {mentor.title}
                        </div>
                        <div className="text-[11.5px] text-[#64748b]">
                          {mentor.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 rounded-lg border border-[#fde68a] bg-[#fffbeb] px-2 py-1 text-[11px] font-semibold text-[#b45309]">
                      <span className="material-symbols-outlined text-[14px] text-amber-500">
                        star
                      </span>
                      <span>{mentor.rating}</span>
                    </div>
                  </div>

                  <div className="mb-3 rounded-lg border border-[#dce9ff]/60 bg-[#eff4ff]/60 p-2.5 text-[11.5px] text-[#434655]">
                    <span className="font-semibold text-[#0b1c30]">Specialization: </span>
                    {mentor.specialization}
                  </div>
                </div>

                <div className="border-t border-[#f1f5f9] pt-3">
                  <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
                    <span className="text-[#64748b]">Advising Quota & Load</span>
                    <span className={`font-semibold ${isNearCapacity ? 'text-amber-600' : 'text-[#004ac6]'}`}>
                      {mentor.activeStudents} / {mentor.maxCapacity} ({loadPercent}%)
                    </span>
                  </div>
                  <div className="mb-2.5 h-2 overflow-hidden rounded-full bg-[#e5eeff]">
                    <div
                      className={`h-full rounded-full transition-all ${isNearCapacity ? 'bg-amber-500' : 'bg-[#2563eb]'}`}
                      style={{ width: `${loadPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="max-w-[180px] truncate text-[#64748b]">
                      {mentor.email}
                    </span>
                    <a
                      href={`mailto:${mentor.email}`}
                      className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#004ac6] hover:underline"
                    >
                      <span className="material-symbols-outlined text-[13px]">mail</span>
                      <span>Contact</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
