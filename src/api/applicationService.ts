import { api } from './apiClient';

export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface InternshipApplication {
  applicationId: number;
  studentId: number;
  studentName?: string;
  studentCode?: string;
  phaseId: number;
  phaseName?: string;
  companyId?: number;
  companyName?: string;
  proposedCompanyName?: string;
  positionTitle?: string;
  companyMentorName?: string;
  companyMentorEmail?: string;
  companyMentorPhone?: string;
  projectTopic?: string;
  startDate?: string;
  endDate?: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedById?: number;
  reviewedByName?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApplicationCreateDTO {
  phaseId: number;
  companyId?: number;
  proposedCompanyName?: string;
  positionTitle?: string;
  companyMentorName?: string;
  companyMentorEmail?: string;
  companyMentorPhone?: string;
  projectTopic?: string;
  startDate?: string;
  endDate?: string;
}

export interface ApplicationReviewDTO {
  mentorId?: number;
  companyId?: number;
  rejectionReason?: string;
}

export const applicationService = {
  getApplications: async (status?: ApplicationStatus): Promise<InternshipApplication[]> => {
    const endpoint = `/api/internship_applications${status ? `?status=${status}` : ''}`;
    return api.get<InternshipApplication[]>(endpoint);
  },

  getApplicationById: async (id: number): Promise<InternshipApplication> => {
    return api.get<InternshipApplication>(`/api/internship_applications/${id}`);
  },

  createDraft: async (body: ApplicationCreateDTO): Promise<InternshipApplication> => {
    return api.post<InternshipApplication>('/api/internship_applications', body);
  },

  updateDraft: async (id: number, body: ApplicationCreateDTO): Promise<InternshipApplication> => {
    return api.put<InternshipApplication>(`/api/internship_applications/${id}`, body);
  },

  submit: async (id: number): Promise<InternshipApplication> => {
    return api.post<InternshipApplication>(`/api/internship_applications/${id}/submit`);
  },

  approve: async (id: number, reviewData?: ApplicationReviewDTO): Promise<InternshipApplication> => {
    return api.post<InternshipApplication>(`/api/internship_applications/${id}/approve`, reviewData || {});
  },

  reject: async (id: number, reason: string): Promise<InternshipApplication> => {
    return api.post<InternshipApplication>(`/api/internship_applications/${id}/reject`, { rejectionReason: reason });
  },

  cancel: async (id: number): Promise<InternshipApplication> => {
    return api.post<InternshipApplication>(`/api/internship_applications/${id}/cancel`);
  },
};
