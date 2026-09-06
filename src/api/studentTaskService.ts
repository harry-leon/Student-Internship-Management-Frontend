import { api, getStoredToken } from './apiClient';

export interface StudentTaskAssignee {
  studentId: number;
  studentCode: string;
  fullName: string;
  email: string;
  status?: string;
}

export interface StudentTask {
  taskId: number;
  groupId: number;
  groupName: string;
  groupCode: string;
  mentorName?: string;
  mentorEmail?: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadlineAt?: string;
  isOverdue?: boolean;
  locked?: boolean;
  assigneeCount?: number;
  assignees?: StudentTaskAssignee[];
  submissionStatus: string; // NOT_SUBMITTED, SUBMITTED, REVIEWED, NEEDS_CHANGES, ACCEPTED, REJECTED
  latestSubmissionId?: number;
  latestSubmissionVersion?: number;
  latestSubmissionType?: 'GITHUB_LINK' | 'ZIP_FILE';
  latestSubmissionTime?: string;
  latestGithubUrl?: string;
  latestFileName?: string;
  latestFileId?: number;
  latestScore?: number;
  latestFeedback?: string;
  canSubmit?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupSubmissionReview {
  reviewId: number;
  reviewerUserId: number;
  reviewerName: string;
  score?: number;
  comment?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupSubmissionItem {
  submissionId: number;
  groupId: number;
  taskId?: number;
  taskTitle?: string;
  submittedByUserId: number;
  submittedByName: string;
  submissionType: 'GITHUB_LINK' | 'ZIP_FILE';
  githubUrl?: string;
  fileId?: number;
  fileName?: string;
  fileSize?: number;
  versionNumber: number;
  note?: string;
  status: string;
  submittedAt: string;
  reviews?: GroupSubmissionReview[];
}

export const studentTaskService = {
  // Student task APIs
  getMyTasks: async (params?: {
    status?: string;
    groupId?: number;
    overdue?: boolean;
  }): Promise<StudentTask[]> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.groupId) query.append('groupId', params.groupId.toString());
    if (params?.overdue !== undefined) query.append('overdue', params.overdue.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<StudentTask[]>(`/api/student/tasks${qs}`);
  },

  getMyTaskDetail: async (taskId: number): Promise<StudentTask> => {
    return api.get<StudentTask>(`/api/student/tasks/${taskId}`);
  },

  submitGithub: async (
    taskId: number,
    payload: { githubUrl: string; note?: string }
  ): Promise<GroupSubmissionItem> => {
    return api.post<GroupSubmissionItem>(`/api/student/tasks/${taskId}/submissions/github`, payload);
  },

  submitZip: async (
    taskId: number,
    file: File,
    note?: string
  ): Promise<GroupSubmissionItem> => {
    const formData = new FormData();
    formData.append('file', file);
    if (note) formData.append('note', note);

    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/student/tasks/${taskId}/submissions/zip`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Tải lên tệp ZIP thất bại');
    }
    return data.data || data;
  },

  getTaskSubmissions: async (taskId: number): Promise<GroupSubmissionItem[]> => {
    return api.get<GroupSubmissionItem[]>(`/api/student/tasks/${taskId}/submissions`);
  },

  // Mentor & Admin assignees management
  updateTaskAssignees: async (
    groupId: number,
    taskId: number,
    payload: { studentIds?: number[]; assignAllMembers?: boolean }
  ) => {
    return api.patch(`/api/mentor-groups/${groupId}/tasks/${taskId}/assignees`, payload);
  },

  // Review submission in group task
  reviewGroupSubmission: async (
    groupId: number,
    submissionId: number,
    payload: { score?: number; comment?: string; status?: string }
  ) => {
    return api.post(`/api/mentor-groups/${groupId}/submissions/${submissionId}/reviews`, payload);
  },

  // Admin Oversight APIs
  getAdminGroupTasks: async (params?: {
    groupId?: number;
    mentorId?: number;
    studentId?: number;
    status?: string;
    overdue?: boolean;
  }): Promise<StudentTask[]> => {
    const query = new URLSearchParams();
    if (params?.groupId) query.append('groupId', params.groupId.toString());
    if (params?.mentorId) query.append('mentorId', params.mentorId.toString());
    if (params?.studentId) query.append('studentId', params.studentId.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.overdue !== undefined) query.append('overdue', params.overdue.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<StudentTask[]>(`/api/admin/group-tasks${qs}`);
  },

  getAdminGroupSubmissions: async (params?: {
    groupId?: number;
    taskId?: number;
    userId?: number;
    status?: string;
  }): Promise<GroupSubmissionItem[]> => {
    const query = new URLSearchParams();
    if (params?.groupId) query.append('groupId', params.groupId.toString());
    if (params?.taskId) query.append('taskId', params.taskId.toString());
    if (params?.userId) query.append('userId', params.userId.toString());
    if (params?.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get<GroupSubmissionItem[]>(`/api/admin/group-submissions${qs}`);
  },
};
