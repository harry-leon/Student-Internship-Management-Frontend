import { api } from './apiClient';
import { Role, AssignmentStatus, StudentSubmission, WeeklyReport } from '../types';
import { AssessmentGradingForm } from './assessmentGradingService';

// ==================== USER SERVICE ====================
export interface UserDTO {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  isActive: boolean;
}

export interface UserQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  role?: string;
}

export const userService = {
  getAll: (params?: UserQueryParams) => {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.size !== undefined) query.append('size', String(params.size));
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortDirection) query.append('sortDirection', params.sortDirection);
    if (params?.role && params.role !== 'ALL') {
      query.append('role', params.role.toUpperCase());
    }
    const queryString = query.toString();
    const url = `/api/users${queryString ? `?${queryString}` : ''}`;
    return api.get<UserDTO[]>(url);
  },
  getById: (id: number) => api.get<UserDTO>(`/api/users/${id}`),
  create: (data: Partial<UserDTO>) => api.post<UserDTO>('/api/users', data),
  update: (id: number, data: Partial<UserDTO>) => api.put<UserDTO>(`/api/users/${id}`, data),
  updateStatus: (id: number, status: boolean) => api.put<UserDTO>(`/api/users/${id}/status`, { status }),
  updateRole: (id: number, role: Role) => api.put<UserDTO>(`/api/users/${id}/role`, { role }),
  delete: (id: number) => api.delete<void>(`/api/users/${id}`),
};

// ==================== STUDENT SERVICE ====================
export interface StudentDTO {
  studentId: number;
  userId?: number;
  studentCode: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  major?: string;
  className?: string;
  dateOfBirth?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentDetailDTO {
  student: StudentDTO;
  currentAssignment?: InternshipAssignmentDTO | null;
  latestSubmission?: StudentSubmission | null;
  recentReports?: WeeklyReport[];
  gradingSummaries?: AssessmentGradingForm[];
}

export const studentService = {
  getAll: () => api.get<StudentDTO[]>('/api/students'),
  getById: (id: number) => api.get<StudentDTO>(`/api/students/${id}`),
  getDetail: (id: number) => api.get<StudentDetailDTO>(`/api/students/${id}/detail`),
  create: (data: Partial<StudentDTO>) => api.post<StudentDTO>('/api/students', data),
  update: (id: number, data: Partial<StudentDTO>) => api.put<StudentDTO>(`/api/students/${id}`, data),
};


// ==================== MENTOR SERVICE ====================
export interface MentorDTO {
  mentorId: number;
  fullName: string;
  email: string;
  department: string;
  academicRank?: string;
}

export const mentorService = {
  getAll: () => api.get<MentorDTO[]>('/api/mentors'),
  getById: (id: number) => api.get<MentorDTO>(`/api/mentors/${id}`),
  create: (data: Partial<MentorDTO>) => api.post<MentorDTO>('/api/mentors', data),
  update: (id: number, data: Partial<MentorDTO>) => api.put<MentorDTO>(`/api/mentors/${id}`, data),
};

// ==================== INTERNSHIP PHASE SERVICE ====================
export interface InternshipPhaseDTO {
  phaseId: number;
  phaseName: string;
  startDate: string;
  endDate: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const phaseService = {
  getAll: () => api.get<InternshipPhaseDTO[]>('/api/internship_phases'),
  getById: (id: number) => api.get<InternshipPhaseDTO>(`/api/internship_phases/${id}`),
  create: (data: Partial<InternshipPhaseDTO>) => api.post<InternshipPhaseDTO>('/api/internship_phases', data),
  update: (id: number, data: Partial<InternshipPhaseDTO>) => api.put<InternshipPhaseDTO>(`/api/internship_phases/${id}`, data),
  delete: (id: number) => api.delete<void>(`/api/internship_phases/${id}`),
};

// ==================== ASSIGNMENT SERVICE ====================
export interface InternshipAssignmentDTO {
  assignmentId: number;
  studentId: number;
  studentCode: string;
  studentFullName: string;
  mentorId: number;
  mentorFullName: string;
  mentorDepartment?: string;
  phaseId: number;
  phaseName: string;
  status: AssignmentStatus;
  assignedDate?: string;
  latestSubmissionId?: number;
  latestSubmissionType?: 'GITHUB' | 'ZIP';
  latestSubmittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const assignmentService = {
  getAll: () => api.get<InternshipAssignmentDTO[]>('/api/internship_assignments'),
  getById: (id: number) => api.get<InternshipAssignmentDTO>(`/api/internship_assignments/${id}`),
  create: (data: Partial<InternshipAssignmentDTO>) => api.post<InternshipAssignmentDTO>('/api/internship_assignments', data),
  updateStatus: (id: number, status: AssignmentStatus) => api.put<InternshipAssignmentDTO>(`/api/internship_assignments/${id}/status`, { status }),
};

// ==================== ASSESSMENT ROUND SERVICE ====================
export interface AssessmentRoundCriterionDTO {
  roundCriterionId?: number;
  criterionId: number;
  criterionName: string;
  description?: string;
  maxScore: number;
  weight: number;
}

export interface AssessmentRoundDTO {
  roundId: number;
  phaseId: number;
  phaseName: string;
  roundName: string;
  startDate: string;
  endDate: string;
  description?: string;
  isActive: boolean;
  criteria?: AssessmentRoundCriterionDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export const roundService = {
  getAll: () => api.get<AssessmentRoundDTO[]>('/api/assessment_rounds'),
  getById: (id: number) => api.get<AssessmentRoundDTO>(`/api/assessment_rounds/${id}`),
  create: (data: Partial<AssessmentRoundDTO>) => api.post<AssessmentRoundDTO>('/api/assessment_rounds', data),
  update: (id: number, data: Partial<AssessmentRoundDTO>) => api.put<AssessmentRoundDTO>(`/api/assessment_rounds/${id}`, data),
  delete: (id: number) => api.delete<void>(`/api/assessment_rounds/${id}`),
};

// ==================== EVALUATION CRITERIA SERVICE ====================
export interface EvaluationCriterionDTO {
  criterionId: number;
  criterionName: string;
  description?: string;
  maxScore: number;
  createdAt?: string;
  updatedAt?: string;
}

export const criterionService = {
  getAll: () => api.get<EvaluationCriterionDTO[]>('/api/evaluation_criteria'),
  getById: (id: number) => api.get<EvaluationCriterionDTO>(`/api/evaluation_criteria/${id}`),
  create: (data: Partial<EvaluationCriterionDTO>) => api.post<EvaluationCriterionDTO>('/api/evaluation_criteria', data),
  update: (id: number, data: Partial<EvaluationCriterionDTO>) => api.put<EvaluationCriterionDTO>(`/api/evaluation_criteria/${id}`, data),
  delete: (id: number) => api.delete<void>(`/api/evaluation_criteria/${id}`),
};

// ==================== ASSESSMENT RESULT SERVICE ====================
export interface AssessmentResultDTO {
  resultId: number;
  assignmentId: number;
  roundCriterionId: number;
  score: number;
  comments?: string;
  evaluatedAt?: string;
}

export const resultService = {
  getAll: () => api.get<AssessmentResultDTO[]>('/api/assessment_results'),
  create: (data: Partial<AssessmentResultDTO>) => api.post<AssessmentResultDTO>('/api/assessment_results', data),
  update: (id: number, data: Partial<AssessmentResultDTO>) => api.put<AssessmentResultDTO>(`/api/assessment_results/${id}`, data),
};
