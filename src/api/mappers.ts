import {
  Student,
  Mentor,
  UserAccount,
  InternshipPhase,
  Assignment,
  AssessmentRound,
  EvaluationCriterion,
  Role,
  AssignmentStatus,
} from '../types';
import {
  StudentDTO,
  MentorDTO,
  UserDTO,
  InternshipPhaseDTO,
  InternshipAssignmentDTO,
  AssessmentRoundDTO,
  EvaluationCriterionDTO,
} from './services';
import { normalizeRole } from '../auth/roles';

export const mapStudentFromDTO = (dto: StudentDTO): Student => {
  return {
    id: String(dto.studentId),
    name: dto.fullName || `Sinh viên ${dto.studentCode}`,
    code: dto.studentCode || `SV${dto.studentId}`,
    email: dto.email || '',
    department: dto.major || 'Chưa cập nhật ngành',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.fullName || 'Student')}&background=0D8ABC&color=fff`,
    phase: 'Chưa phân đợt',
    mentor: 'Chưa phân công',
    company: 'Chưa phân công',
    status: 'PENDING',
    progress: 0,
  };
};

export const mapMentorFromDTO = (dto: MentorDTO): Mentor => {
  return {
    id: String(dto.mentorId),
    name: dto.fullName || `Giảng viên ${dto.mentorId}`,
    title: dto.academicRank || 'Giảng viên Hướng dẫn',
    department: dto.department || 'Khoa CNTT',
    email: dto.email || '',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.fullName || 'Mentor')}&background=4F46E5&color=fff`,
    activeStudents: 0,
    maxCapacity: 15,
    specialization: dto.department || 'Software Engineering',
    rating: 5.0,
  };
};

export const mapUserFromDTO = (dto: UserDTO): UserAccount => {
  return {
    id: String(dto.userId || (dto as any).id || 1),
    name: dto.fullName || dto.username || 'User',
    email: dto.email || '',
    role: normalizeRole(dto.role),
    status: dto.isActive !== false ? 'Active' : 'Suspended',
    department: 'Hệ thống',
    lastActive: 'Vừa xong',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.fullName || dto.username || 'User')}&background=2563EB&color=fff`,
  };
};

export const mapPhaseFromDTO = (dto: InternshipPhaseDTO): InternshipPhase => {
  return {
    id: String(dto.phaseId),
    name: dto.phaseName,
    term: 'Spring 2026',
    status: 'ACTIVE',
    startDate: dto.startDate || '2026-01-01',
    endDate: dto.endDate || '2026-05-30',
    weeksRemaining: 8,
    progressPercent: 50,
    targetMilestone: dto.description || 'Đợt thực tập chính thức',
    totalStudents: 0,
    totalMentors: 0,
    scheduledRounds: 0,
  };
};

export const mapAssignmentFromDTO = (dto: InternshipAssignmentDTO): Assignment => {
  return {
    id: String(dto.assignmentId),
    studentName: dto.studentFullName || `Sinh viên ${dto.studentCode}`,
    studentCode: dto.studentCode || '',
    studentAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(dto.studentFullName || 'Student')}&background=0D8ABC&color=fff`,
    mentorName: dto.mentorFullName || 'Chưa phân công',
    mentorDept: dto.mentorDepartment || 'Khoa CNTT',
    phase: dto.phaseName || 'Đợt thực tập',
    date: dto.assignedDate ? dto.assignedDate.split('T')[0] : '2026-01-15',
    status: (dto.status as AssignmentStatus) || 'IN PROGRESS',
    companyName: 'Doanh nghiệp thực tập',
    projectTopic: 'Đề tài thực tập',
  };
};

export const mapRoundFromDTO = (dto: AssessmentRoundDTO): AssessmentRound => {
  return {
    id: String(dto.roundId),
    name: dto.roundName,
    phase: dto.phaseName || 'Đợt thực tập',
    status: dto.isActive ? 'ACTIVE' : 'COMPLETED',
    dateRange: `${dto.startDate || ''} - ${dto.endDate || ''}`,
    timeRemainingText: 'Đang diễn ra',
    completionRate: 0,
    totalSubmissions: 0,
    evaluatedSubmissions: 0,
  };
};

export const mapCriterionFromDTO = (dto: EvaluationCriterionDTO): EvaluationCriterion => {
  return {
    id: String(dto.criterionId),
    name: dto.criterionName,
    category: 'Đánh giá chung',
    weight: 20,
    maxScore: dto.maxScore || 10,
    description: dto.description || '',
  };
};
