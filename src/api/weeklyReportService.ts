import { api } from './apiClient';
import { WeeklyReport, WeeklyReportStatus } from '../types';

export interface WeeklyReportCreateParams {
  assignmentId: number;
  weekNumber: number;
  reportTitle?: string;
  completedTasks: string;
  difficulties?: string;
  nextPlan?: string;
  workingHours?: number;
  attachmentUrl?: string;
}

export interface WeeklyReportUpdateParams {
  reportTitle?: string;
  completedTasks: string;
  difficulties?: string;
  nextPlan?: string;
  workingHours?: number;
  attachmentUrl?: string;
}

export interface WeeklyReportReviewParams {
  mentorComment: string;
  status: WeeklyReportStatus;
}

export const weeklyReportService = {
  getReports: async (params?: {
    phaseId?: number;
    assignmentId?: number;
    studentId?: number;
    mentorId?: number;
    status?: WeeklyReportStatus;
    weekNumber?: number;
    page?: number;
    size?: number;
  }): Promise<{ content: WeeklyReport[] } | WeeklyReport[]> => {
    const query = new URLSearchParams();
    if (params?.phaseId) query.append('phaseId', params.phaseId.toString());
    if (params?.assignmentId) query.append('assignmentId', params.assignmentId.toString());
    if (params?.studentId) query.append('studentId', params.studentId.toString());
    if (params?.mentorId) query.append('mentorId', params.mentorId.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.weekNumber) query.append('weekNumber', params.weekNumber.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<WeeklyReport[]>(`/api/weekly_reports${queryString}`);
  },

  getReportById: async (reportId: number): Promise<WeeklyReport> => {
    return api.get<WeeklyReport>(`/api/weekly_reports/${reportId}`);
  },

  createReport: async (data: WeeklyReportCreateParams): Promise<WeeklyReport> => {
    return api.post<WeeklyReport>('/api/weekly_reports', data);
  },

  updateReport: async (reportId: number, data: WeeklyReportUpdateParams): Promise<WeeklyReport> => {
    return api.put<WeeklyReport>(`/api/weekly_reports/${reportId}`, data);
  },

  submitReport: async (reportId: number): Promise<WeeklyReport> => {
    return api.post<WeeklyReport>(`/api/weekly_reports/${reportId}/submit`);
  },

  reviewReport: async (reportId: number, data: WeeklyReportReviewParams): Promise<WeeklyReport> => {
    return api.post<WeeklyReport>(`/api/weekly_reports/${reportId}/review`, data);
  },

  deleteReport: async (reportId: number): Promise<void> => {
    await api.delete(`/api/weekly_reports/${reportId}`);
  },
};
