import React, { useState, useEffect } from 'react';
import { Role, Student } from '../types';
import { GradingFormModal } from '../components/GradingFormModal';
import { assignmentService } from '../api/services';

interface AssessmentResultsViewProps {
  students: Student[];
  currentRole?: Role;
}

export const AssessmentResultsView: React.FC<AssessmentResultsViewProps> = ({
  students,
  currentRole = 'Admin',
}) => {
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number>(1);
  const [selectedRoundId, setSelectedRoundId] = useState<number>(1);
  const [displayList, setDisplayList] = useState<Student[]>(students);

  useEffect(() => {
    if (students.length === 0) {
      assignmentService.getAll()
        .then((res) => {
          let arr = [];
          if (Array.isArray(res)) arr = res;
          else if (typeof res === 'object' && Array.isArray((res as any).content)) arr = (res as any).content;
          else if (typeof res === 'object' && Array.isArray((res as any).data)) arr = (res as any).data;

          if (arr.length > 0) {
            const mapped: Student[] = arr.map((a: any) => ({
              id: String(a.assignmentId || a.id),
              name: a.studentName || 'Sinh viên',
              code: a.studentCode || 'N/A',
              email: a.studentEmail || 'N/A',
              department: a.studentMajor || 'Software Engineering',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              phase: a.phaseName || 'Spring 2026',
              mentor: a.mentorName || 'Chưa phân công',
              company: a.companyName || 'Doanh nghiệp',
              status: 'IN PROGRESS',
              progress: 85,
              score: 8.5,
            }));
            setDisplayList(mapped);
          }
        })
        .catch((err) => console.warn('Error fetching assignments for grading:', err));
    } else {
      setDisplayList(students);
    }
  }, [students]);

  const mockDisplayStudents = displayList.length > 0 ? displayList : [
    {
      id: '1',
      name: 'Nguyen Van A',
      code: 'SE190001',
      email: 'nva@fpt.edu.vn',
      department: 'Software Engineering',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      phase: 'Spring 2026',
      mentor: 'Dr. Le Thi B',
      company: 'FPT Software',
      status: 'IN PROGRESS' as const,
      progress: 85,
      score: 8.7,
    },
    {
      id: '2',
      name: 'Tran Thi C',
      code: 'SE190002',
      email: 'ttc@fpt.edu.vn',
      department: 'Information Assurance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      phase: 'Spring 2026',
      mentor: 'Dr. Le Thi B',
      company: 'Viettel Telecom',
      status: 'IN PROGRESS' as const,
      progress: 90,
      score: 9.2,
    },
  ];

  const handleOpenGrading = (assignmentIdNum: number, roundIdNum: number) => {
    setSelectedAssignmentId(assignmentIdNum);
    setSelectedRoundId(roundIdNum);
    setIsGradingOpen(true);
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-200 space-y-3.5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-[20px]">grading</span>
            <h1 className="text-[20px] font-bold text-[#0b1c30] tracking-tight">
              Bảng Điểm Đánh Giá & Rubric Grading
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý bảng điểm thực tập, chấm điểm theo Rubric & công bố kết quả đánh giá.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentRole !== 'Student' && (
            <button
              type="button"
              onClick={() => handleOpenGrading(1, 1)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#004ac6] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003eb3] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span>Chấm Điểm Rubric</span>
            </button>
          )}
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            98.8% Đã Đạt
          </span>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
            Điểm Trung Bình Đợt
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-[24px] font-bold text-[#0b1c30]">8.72</span>
            <span className="text-[11px] text-slate-500">/ 10.0</span>
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span>+0.35 so với kỳ trước</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
            Xuất Sắc (Grade A)
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-[24px] font-bold text-[#004ac6]">64.2%</span>
            <span className="text-[11px] text-slate-500">sinh viên</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Đạt chuẩn Rubric doanh nghiệp
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
            Tỷ Lệ Nhận Việc Doanh Nghiệp
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-[24px] font-bold text-[#712ae2]">78.5%</span>
            <span className="text-[11px] text-slate-500">offer chính thức</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Tuyển dụng trực tiếp sau thực tập
          </div>
        </div>
      </div>

      {/* Student Scorecards Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-slate-100">
          <h3 className="text-xs font-bold text-[#0b1c30]">
            Bảng Tổng Hợp Điểm Đánh Giá Sinh Viên
          </h3>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase text-slate-600 tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3.5">Sinh Viên</th>
                <th className="py-2.5 px-3">Giảng Viên Hướng Dẫn</th>
                <th className="py-2.5 px-3">Doanh Nghiệp</th>
                <th className="py-2.5 px-3">Kỹ Thuật (50%)</th>
                <th className="py-2.5 px-3">Thái Độ (50%)</th>
                <th className="py-2.5 px-3">Điểm Trọng Số</th>
                <th className="py-2.5 px-3">Trạng Thái</th>
                <th className="py-2.5 px-3.5 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {mockDisplayStudents.map((s, idx) => {
                const score = s.score || 8.5;
                const isHonors = score >= 9.0;
                const assignmentIdNum = Number(s.id) || (idx + 1);

                return (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-semibold text-[#0b1c30]">{s.name}</div>
                          <div className="text-[10.5px] font-mono text-slate-500">{s.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{s.mentor}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.company}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                      {(score * 0.95).toFixed(1)} / 10
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                      {(score * 1.02 > 10 ? 10 : score * 1.02).toFixed(1)} / 10
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#004ac6]">
                      {score.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      {isHonors ? (
                        <span className="inline-flex items-center px-2 py-0.2 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          XUẤT SẮC
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          GIỎI
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenGrading(assignmentIdNum, 1)}
                        className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-[#004ac6] hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        {currentRole === 'Student' ? 'Xem Rubric' : 'Chấm / Sửa'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <GradingFormModal
        isOpen={isGradingOpen}
        onClose={() => setIsGradingOpen(false)}
        assignmentId={selectedAssignmentId}
        roundId={selectedRoundId}
        currentRole={currentRole}
      />
    </div>
  );
};
