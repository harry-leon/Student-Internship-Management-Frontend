import React, { useState } from 'react';
import { Role, Student } from '../types';
import { GradingFormModal } from '../components/GradingFormModal';

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

  const mockDisplayStudents = students.length > 0 ? students : [
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
    <div className="flex flex-col w-full animate-in fade-in duration-200 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0b1c30] tracking-tight">
            Assessment Results & Rubric Grading
          </h1>
          <p className="text-[13px] text-[#64748b] mt-0.5">
            Quản lý bảng điểm thực tập, chấm điểm theo Rubric & công bố kết quả đánh giá.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentRole !== 'Student' && (
            <button
              type="button"
              onClick={() => handleOpenGrading(1, 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#004ac6] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003eb3] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
              <span>Chấm Điểm Rubric</span>
            </button>
          )}
          <span className="text-[13px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            98.8% Đã Đạt
          </span>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-[#64748b] tracking-wider mb-2">
            Điểm Trung Bình Đợt
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-[#0b1c30]">8.72</span>
            <span className="text-[12px] text-[#64748b]">/ 10.0</span>
          </div>
          <div className="text-[12px] text-emerald-600 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+0.35 so với kỳ trước</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-[#64748b] tracking-wider mb-2">
            Xuất Sắc (Grade A)
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-[#004ac6]">64.2%</span>
            <span className="text-[12px] text-[#64748b]">sinh viên</span>
          </div>
          <div className="text-[12px] text-[#64748b] mt-1">
            Đạt chuẩn Rubric doanh nghiệp
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
          <div className="text-[11px] font-semibold uppercase text-[#64748b] tracking-wider mb-2">
            Tỷ Lệ Nhận Việc Doanh Nghiệp
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] font-bold text-[#712ae2]">78.5%</span>
            <span className="text-[12px] text-[#64748b]">offer chính thức</span>
          </div>
          <div className="text-[12px] text-[#64748b] mt-1">
            Tuyển dụng trực tiếp sau thực tập
          </div>
        </div>
      </div>

      {/* Student Scorecards Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
        <h3 className="text-[17px] font-semibold text-[#0b1c30] mb-4">
          Bảng Tổng Hợp Điểm Đánh Giá Sinh Viên
        </h3>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] text-[11px] font-semibold uppercase text-[#434655] tracking-wider border-b border-[#dce9ff]">
                <th className="py-2.5 px-4 rounded-l-lg">Sinh Viên</th>
                <th className="py-2.5 px-4">Giảng Viên Hướng Dẫn</th>
                <th className="py-2.5 px-4">Doanh Nghiệp</th>
                <th className="py-2.5 px-4">Kỹ Thuật (50%)</th>
                <th className="py-2.5 px-4">Thái Độ (50%)</th>
                <th className="py-2.5 px-4">Điểm Trọng Số</th>
                <th className="py-2.5 px-4">Trạng Thái</th>
                <th className="py-2.5 px-4 rounded-r-lg text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9] text-[13px] text-[#0b1c30]">
              {mockDisplayStudents.map((s, idx) => {
                const score = s.score || 8.5;
                const isHonors = score >= 9.0;
                const assignmentIdNum = Number(s.id) || (idx + 1);

                return (
                  <tr key={s.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover border border-[#e2e8f0]"
                        />
                        <div>
                          <div className="font-semibold text-[#0b1c30]">{s.name}</div>
                          <div className="text-[11px] font-mono text-[#64748b]">{s.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#434655]">{s.mentor}</td>
                    <td className="py-3 px-4 text-[#434655]">{s.company}</td>
                    <td className="py-3 px-4 font-mono font-medium text-[#0b1c30]">
                      {(score * 0.95).toFixed(1)} / 10
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-[#0b1c30]">
                      {(score * 1.02 > 10 ? 10 : score * 1.02).toFixed(1)} / 10
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#004ac6]">
                      {score.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {isHonors ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#eaddff] text-[#5a00c6] border border-[#d2bbff]">
                          XUẤT SẮC
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#cce5ff] text-[#004b73] border border-[#93ccff]">
                          GIỎI
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenGrading(assignmentIdNum, 1)}
                        className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#004ac6] hover:bg-blue-100 transition-colors"
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
