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
    <div className="flex w-full flex-col animate-in fade-in duration-200 space-y-3.5">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">supervisor_account</span>
            <h1 className="text-[20px] font-bold tracking-tight text-[#0b1c30]">
              Đội Ngũ Giảng Viên Hướng Dẫn
            </h1>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Giảng viên cố vấn thực tập, hạn mức hướng dẫn và tỷ lệ phân công sinh viên.
          </p>
        </div>
        <div className="self-start rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#004ac6] sm:self-auto">
          Tổng số giảng viên: {mentors.length}
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="max-w-md rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-1.5">
          <span className="material-symbols-outlined text-[17px] text-slate-400">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm theo tên, khoa, chuyên ngành..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-[#0b1c30] outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12 text-[#004ac6]">
          <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#004ac6] border-t-transparent"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-2xs">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#004ac6]">
            <span className="material-symbols-outlined text-[22px]">supervisor_account</span>
          </div>
          <h3 className="text-sm font-semibold text-[#0b1c30]">Chưa có dữ liệu Giảng viên</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Cơ sở dữ liệu backend hiện tại chưa ghi nhận danh sách giảng viên hướng dẫn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((mentor) => {
            const loadPercent = Math.round((mentor.activeStudents / mentor.maxCapacity) * 100);
            const isNearCapacity = loadPercent >= 90;

            return (
              <div
                key={mentor.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs transition-all hover:border-slate-300 hover:shadow-xs"
              >
                <div>
                  <div className="mb-2.5 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={mentor.avatar}
                        alt={mentor.name}
                        className="h-10 w-10 rounded-lg border border-slate-200 object-cover shadow-2xs"
                      />
                      <div>
                        <h3 className="text-xs font-bold text-[#0b1c30]">
                          {mentor.name}
                        </h3>
                        <div className="text-[11px] font-semibold text-[#004ac6]">
                          {mentor.title}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {mentor.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-800">
                      <span className="material-symbols-outlined text-[13px] text-amber-500">
                        star
                      </span>
                      <span>{mentor.rating}</span>
                    </div>
                  </div>

                  <div className="mb-2.5 rounded-lg border border-blue-100 bg-blue-50/40 p-2 text-[11px] text-slate-700">
                    <span className="font-semibold text-slate-900">Lĩnh vực: </span>
                    {mentor.specialization}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2.5">
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Chỉ tiêu & Tải trọng</span>
                    <span className={`font-semibold ${isNearCapacity ? 'text-amber-600' : 'text-[#004ac6]'}`}>
                      {mentor.activeStudents} / {mentor.maxCapacity} ({loadPercent}%)
                    </span>
                  </div>
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${isNearCapacity ? 'bg-amber-500' : 'bg-[#004ac6]'}`}
                      style={{ width: `${loadPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="max-w-[180px] truncate text-slate-400">
                      {mentor.email}
                    </span>
                    <a
                      href={`mailto:${mentor.email}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#004ac6] hover:underline"
                    >
                      <span className="material-symbols-outlined text-[13px]">mail</span>
                      <span>Liên hệ</span>
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
