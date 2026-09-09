import { api, getStoredToken } from './apiClient';
import { StudentSubmission, StudentSubmissionType } from '../types';

export interface StudentSubmissionGithubParams {
  assignmentId: number;
  roundId?: number;
  githubUrl: string;
  note?: string;
}

export interface StudentSubmissionSearchParams {
  phaseId?: number;
  roundId?: number;
  assignmentId?: number;
  studentId?: number;
  mentorId?: number;
  studentCode?: string;
  type?: StudentSubmissionType;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export const studentSubmissionService = {
  getSubmissions: async (
    params?: StudentSubmissionSearchParams
  ): Promise<StudentSubmission[] & { _page?: any }> => {
    const query = new URLSearchParams();
    if (params?.phaseId) query.append('phaseId', params.phaseId.toString());
    if (params?.roundId) query.append('roundId', params.roundId.toString());
    if (params?.assignmentId) query.append('assignmentId', params.assignmentId.toString());
    if (params?.studentId) query.append('studentId', params.studentId.toString());
    if (params?.mentorId) query.append('mentorId', params.mentorId.toString());
    if (params?.studentCode) query.append('studentCode', params.studentCode);
    if (params?.type) query.append('type', params.type);
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortDirection) query.append('sortDirection', params.sortDirection);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<StudentSubmission[] & { _page?: any }>(`/api/student-submissions${queryString}`);
  },

  getMySubmissions: async (params?: {
    roundId?: number;
    type?: StudentSubmissionType;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<StudentSubmission[] & { _page?: any }> => {
    const query = new URLSearchParams();
    if (params?.roundId) query.append('roundId', params.roundId.toString());
    if (params?.type) query.append('type', params.type);
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    if (params?.sortDirection) query.append('sortDirection', params.sortDirection);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return api.get<StudentSubmission[] & { _page?: any }>(`/api/student-submissions/my${queryString}`);
  },

  getSubmissionById: async (id: number): Promise<StudentSubmission> => {
    return api.get<StudentSubmission>(`/api/student-submissions/${id}`);
  },

  submitGithub: async (data: StudentSubmissionGithubParams): Promise<StudentSubmission> => {
    return api.post<StudentSubmission>('/api/student-submissions/github', data);
  },

  submitZip: async (formData: FormData): Promise<StudentSubmission> => {
    return api.post<StudentSubmission>('/api/student-submissions/zip', formData);
  },

  downloadZip: async (id: number, customFilename?: string): Promise<void> => {
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/student-submissions/${id}/download`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Không thể tải xuống tệp bài nộp');
    }

    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition');
    let filename = customFilename || `submission-${id}.zip`;

    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  deleteSubmission: async (id: number): Promise<void> => {
    await api.delete(`/api/student-submissions/${id}`);
  },
};
