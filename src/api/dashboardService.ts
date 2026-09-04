import { api } from './apiClient';

export interface DashboardSummaryResponse {
  role: string;
  kpis: Record<string, any>;
  details: Record<string, any>;
}

export const dashboardService = {
  getMyDashboard: async (): Promise<DashboardSummaryResponse> => {
    return api.get<DashboardSummaryResponse>('/api/dashboard/me');
  },
};
