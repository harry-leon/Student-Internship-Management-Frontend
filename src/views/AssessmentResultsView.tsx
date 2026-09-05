import React, { useState, useEffect } from 'react';
import { Role, Student } from '../types';
import { GradingFormModal } from '../components/GradingFormModal';
import { assignmentService } from '../api/services';
import { assessmentGradingService, AssessmentGradingForm } from '../api/assessmentGradingService';
import { useAuth } from '../context/AuthContext';
import { canGrade } from '../auth/roleAccess';

interface AssessmentResultsViewProps {
  students: Student[];
  currentRole?: Role;
}

export const AssessmentResultsView: React.FC<AssessmentResultsViewProps> = ({
  students,
  currentRole = 'Admin',
}) => {
  const { can, hasFeature } = useAuth();
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number>(1);
  const [selectedRoundId, setSelectedRoundId] = useState<number>(1);
  const [displayList, setDisplayList] = useState<Student[]>(students);
  const [loading, setLoading] = useState(false);

  // Student-specific state
  const [myResults, setMyResults] = useState<AssessmentGradingForm[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);

  const isStudent = currentRole === 'Student';
  const isMentor = currentRole === 'Mentor';
  const isAdmin = currentRole === 'Admin';
  const userCanGrade = canGrade((currentRole as Role) || 'Admin', can, hasFeature);

  useEffect(() => {
    if (isStudent) {
      setStudentLoading(true);
      assessmentGradingService.getResults()
        .then((res) => {
          setMyResults(Array.isArray(res) ? res : []);
        })
        .catch((err) => {
          console.warn('Error fetching student assessment results:', err);
          setMyResults([]);
        })
        .finally(() => setStudentLoading(false));
    } else {
      setLoading(true);
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
        .catch((err) => console.warn('Error fetching assignments for grading:', err))
        .finally(() => setLoading(false));
    }
  }, [currentRole, isStudent]);

  const handleOpenGrading = (assignmentIdNum: number, roundIdNum: number) => {
    if (!userCanGrade) return;
    setSelectedAssignmentId(assignmentIdNum);
    setSelectedRoundId(roundIdNum);
    setIsGradingOpen(true);
  };

  // =========================================================================
  // STUDENT VIEW: Dedicated Personal Evaluation Scorecard (Zero Grading Tools)
  // =========================================================================
  if (isStudent) {
    return (
      <div className="flex flex-col w-full animate-in fade-in duration-200 space-y-4">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[20px]">workspace_premium</span>
              <h1 className="text-[20px] font-bold text-[#0b1c30] tracking-tight">
                Kết Quả Đánh Giá Thực Tập
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Bảng điểm chi tiết theo tiêu chí Rubric và nhận xét đánh giá từ Giảng viên hướng dẫn.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              Cổng Sinh Viên
            </span>
          </div>
        </div>

        {studentLoading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            Đang tải kết quả đánh giá của bạn...
          </div>
        ) : myResults.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto my-6 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[28px]">pending_actions</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Chưa Có Kết Quả Đánh Giá Công Bố</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Kết quả đánh giá đợt thực tập của bạn hiện đang trong quá trình chấm điểm hoặc chưa được Quản trị viên công bố chính thức. Vui lòng quay lại kiểm tra sau.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myResults.map((res, index) => {
              const totalScore = res.totalScore ?? 0;
              const weightedScore = res.weightedScore ?? totalScore;
              const isHonors = (weightedScore || totalScore) >= 9.0;
              const isGood = (weightedScore || totalScore) >= 8.0;

              return (
                <div key={res.submissionId || index} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                  {/* Score Header Summary */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 via-slate-50/30 to-transparent">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {res.roundName || 'Đợt đánh giá thực tập'}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ ĐÃ CÔNG BỐ
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-[#0b1c30] mt-1">
                          Phiếu Đánh Giá Sinh Viên
                        </h2>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Giảng viên chấm: <strong className="text-slate-700">{res.evaluatedByName || 'Giảng viên hướng dẫn'}</strong>
                          {res.publishedAt && (
                            <span className="ml-2 text-slate-400">
                              (Công bố: {new Date(res.publishedAt).toLocaleDateString('vi-VN')})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Overall Scores */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[10.5px] uppercase font-semibold text-slate-400">Điểm Trọng Số</div>
                          <div className="text-[26px] font-bold text-[#004ac6] leading-none mt-0.5 font-mono">
                            {weightedScore.toFixed(2)}
                            <span className="text-xs font-normal text-slate-400 ml-1">/ 10</span>
                          </div>
                        </div>
                        <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
                        <div>
                          {isHonors ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              XUẤT SẮC
                            </span>
                          ) : isGood ? (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              GIỎI
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ĐẠT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Criteria Breakdown Table */}
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase text-slate-600 tracking-wider border-b border-slate-200">
                          <th className="py-2.5 px-4 w-12 text-center">STT</th>
                          <th className="py-2.5 px-4">Tiêu Chí Đánh Giá Rubric</th>
                          <th className="py-2.5 px-3 text-center w-28">Trọng Số</th>
                          <th className="py-2.5 px-3 text-center w-28">Điểm Tối Đa</th>
                          <th className="py-2.5 px-3 text-center w-28">Điểm Đạt Được</th>
                          <th className="py-2.5 px-4">Nhận Xét Của Giảng Viên</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {(res.criteria || []).map((c, cIdx) => (
                          <tr key={c.criterionId || cIdx} className="hover:bg-blue-50/30 transition-colors">
                            <td className="py-3 px-4 text-center font-mono text-slate-400">{cIdx + 1}</td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900">{c.criterionName}</div>
                              {c.description && <div className="text-[11px] text-slate-500 mt-0.5">{c.description}</div>}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                              {c.weight}%
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-slate-500">
                              {c.maxScore}
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-[#004ac6] text-sm">
                              {c.score != null ? c.score.toFixed(1) : '--'}
                            </td>
                            <td className="py-3 px-4 text-slate-600 italic">
                              {c.comments || 'Không có nhận xét thêm.'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // ADMIN & MENTOR VIEW: Grading Management & Rubric Assessment
  // =========================================================================
  const displayStudents = displayList.length > 0 ? displayList : [
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
            {isMentor
              ? 'Quản lý bảng điểm thực tập & chấm điểm theo Rubric cho sinh viên hướng dẫn.'
              : 'Quản lý bảng điểm thực tập, chấm điểm theo Rubric & công bố kết quả đánh giá.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userCanGrade && (
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
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#0b1c30]">
            Bảng Tổng Hợp Điểm Đánh Giá Sinh Viên
          </h3>
          <span className="text-[11px] text-slate-500">
            {displayStudents.length} sinh viên trong danh sách
          </span>
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
              {displayStudents.map((s, idx) => {
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
                      {userCanGrade ? (
                        <button
                          type="button"
                          onClick={() => handleOpenGrading(assignmentIdNum, 1)}
                          className="rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#004ac6] hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          Chấm / Sửa
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {userCanGrade && (
        <GradingFormModal
          isOpen={isGradingOpen}
          onClose={() => setIsGradingOpen(false)}
          assignmentId={selectedAssignmentId}
          roundId={selectedRoundId}
          currentRole={currentRole}
        />
      )}
    </div>
  );
};
