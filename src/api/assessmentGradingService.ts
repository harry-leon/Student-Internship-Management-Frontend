import { api } from './apiClient';

export type AssessmentSubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'PUBLISHED' | 'RETURNED';

export interface GradingCriterionItem {
  criterionId: number;
  criterionName: string;
  description?: string;
  maxScore: number;
  weight: number;
  score?: number;
  comments?: string;
}

export interface AssessmentGradingForm {
  submissionId?: number;
  assignmentId: number;
  studentId: number;
  studentName?: string;
  studentCode?: string;
  mentorId?: number;
  mentorName?: string;
  roundId: number;
  roundName?: string;
  criteria: GradingCriterionItem[];
  totalScore?: number;
  weightedScore?: number;
  status: AssessmentSubmissionStatus;
  evaluatedById?: number;
  evaluatedByName?: string;
  submittedAt?: string;
  publishedAt?: string;
}

export interface AssessmentGradingPayload {
  assignmentId: number;
  roundId: number;
  items: {
    criterionId: number;
    score: number;
    comments?: string;
  }[];
}

export const assessmentGradingService = {
  getGradingForm: async (assignmentId: number, roundId: number): Promise<AssessmentGradingForm> => {
    return api.get<AssessmentGradingForm>(`/api/assessment_grading/forms?assignmentId=${assignmentId}&roundId=${roundId}`);
  },

  saveDraft: async (payload: AssessmentGradingPayload): Promise<AssessmentGradingForm> => {
    return api.post<AssessmentGradingForm>('/api/assessment_grading/draft', payload);
  },

  submitGrading: async (payload: AssessmentGradingPayload): Promise<AssessmentGradingForm> => {
    return api.post<AssessmentGradingForm>('/api/assessment_grading/submit', payload);
  },

  publishSubmission: async (submissionId: number): Promise<AssessmentGradingForm> => {
    return api.post<AssessmentGradingForm>(`/api/assessment_grading/${submissionId}/publish`);
  },

  getResults: async (params?: { roundId?: number; assignmentId?: number }): Promise<AssessmentGradingForm[]> => {
    const query = new URLSearchParams();
    if (params?.roundId) query.append('roundId', params.roundId.toString());
    if (params?.assignmentId) query.append('assignmentId', params.assignmentId.toString());
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<AssessmentGradingForm[]>(`/api/assessment_grading/results${queryString}`);
  },
};
