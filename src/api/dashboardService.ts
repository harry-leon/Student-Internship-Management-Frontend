import { api } from './apiClient';

export interface DashboardMentorWorkload {
  mentorId: number;
  name: string;
  department?: string;
  current: number;
  max: number;
  percent: number;
  tag?: string;
}

export interface DashboardCompanyDistribution {
  company: string;
  count: number;
  percent: number;
}

export interface DashboardSummaryResponse {
  role: string;
  kpis: Record<string, any>;
  details: Record<string, any> & {
    mentorWorkloads?: DashboardMentorWorkload[];
    companyDistribution?: DashboardCompanyDistribution[];
  };
}

export const dashboardService = {
  getMyDashboard: async (): Promise<DashboardSummaryResponse> => {
    return api.get<DashboardSummaryResponse>('/api/dashboard/me');
  },
  getAdminDashboard: async (): Promise<DashboardSummaryResponse> => {
    return api.get<DashboardSummaryResponse>('/api/dashboard/admin');
  },
  getAdminDashboardByPhase: async (phaseId: number): Promise<DashboardSummaryResponse> => {
    return api.get<DashboardSummaryResponse>(`/api/dashboard/admin/phase/${phaseId}`);
  },
  getMentorDashboard: async (): Promise<DashboardSummaryResponse> => {
    return api.get<DashboardSummaryResponse>('/api/dashboard/mentor');
  },
  getStudentDashboard: async (): Promise<DashboardSummaryResponse> => {
    return api.get<DashboardSummaryResponse>('/api/dashboard/student');
  },
};
