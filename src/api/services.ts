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
  delete: (id: number) => api.delete<void>(`/api/students/${id}`),
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
  delete: (id: number) => api.delete<void>(`/api/mentors/${id}`),
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
  delete: (id: number) => api.delete<void>(`/api/internship_assignments/${id}`),
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

// ==================== MENTOR GROUP SERVICE ====================
export interface MentorGroupDTO {
  groupId: number;
  mentorId: number;
  mentorName: string;
  mentorEmail?: string;
  phaseId: number;
  phaseName: string;
  groupName: string;
  groupCode: string;
  description?: string;
  maxStudents: number;
  isActive: boolean;
  allowSelfJoin: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MentorGroupDetailDTO extends MentorGroupDTO {
  members: GroupMemberDTO[];
}

export interface GroupMemberDTO {
  memberId: number;
  studentId: number;
  studentCode: string;
  studentName: string;
  studentEmail: string;
  studentMajor?: string;
  joinMethod: 'MANUAL' | 'CODE';
  status: 'ACTIVE' | 'REMOVED';
  groupRole?: 'OWNER' | 'CO_MENTOR' | 'LEADER' | 'MEMBER' | 'OBSERVER';
  isMuted?: boolean;
  mutedUntil?: string;
  joinedAt: string;
  removedAt?: string;
}

export interface MentorGroupSearchDTO {
  groupId: number;
  groupName: string;
  groupCode: string;
  mentorName: string;
  phaseName: string;
  memberCount: number;
  maxStudents: number;
  allowSelfJoin: boolean;
}

export const mentorGroupService = {
  create: (data: {
    groupName: string;
    groupCode?: string;
    phaseId: number;
    mentorId?: number;
    joinPassword?: string;
    description?: string;
    maxStudents?: number;
    allowSelfJoin?: boolean;
  }) => api.post<MentorGroupDTO>('/api/mentor-groups', data),

  getMyGroups: () => api.get<MentorGroupDTO[]>('/api/mentor-groups/my'),

  getAll: (params?: { mentorName?: string; phaseId?: number; active?: boolean; page?: number; size?: number }) => {
    const query = new URLSearchParams();
    if (params?.mentorName) query.append('mentorName', params.mentorName);
    if (params?.phaseId !== undefined) query.append('phaseId', String(params.phaseId));
    if (params?.active !== undefined) query.append('active', String(params.active));
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.size !== undefined) query.append('size', String(params.size));
    const queryString = query.toString();
    return api.get<any>(`/api/mentor-groups${queryString ? `?${queryString}` : ''}`);
  },

  getDetail: (groupId: number) => api.get<MentorGroupDetailDTO>(`/api/mentor-groups/${groupId}`),

  update: (groupId: number, data: {
    groupName: string;
    description?: string;
    maxStudents?: number;
    isActive?: boolean;
    allowSelfJoin?: boolean;
  }) => api.put<MentorGroupDTO>(`/api/mentor-groups/${groupId}`, data),

  updateStatus: (groupId: number, isActive: boolean) =>
    api.patch<void>(`/api/mentor-groups/${groupId}/status`, { isActive }),

  updatePassword: (groupId: number, joinPassword: string) =>
    api.patch<void>(`/api/mentor-groups/${groupId}/join-password`, { joinPassword }),

  addMember: (groupId: number, identifier: string) =>
    api.post<GroupMemberDTO>(`/api/mentor-groups/${groupId}/members`, { identifier }),

  getMembers: (groupId: number) =>
    api.get<GroupMemberDTO[]>(`/api/mentor-groups/${groupId}/members`),

  removeMember: (groupId: number, studentId: number) =>
    api.delete<void>(`/api/mentor-groups/${groupId}/members/${studentId}`),

  search: (params?: { mentorName?: string; groupCode?: string }) => {
    const query = new URLSearchParams();
    if (params?.mentorName) query.append('mentorName', params.mentorName);
    if (params?.groupCode) query.append('groupCode', params.groupCode);
    const queryString = query.toString();
    return api.get<MentorGroupSearchDTO[]>(`/api/mentor-groups/search${queryString ? `?${queryString}` : ''}`);
  },

  joinByCode: (data: { groupCode: string; joinPassword: string }) =>
    api.post<MentorGroupDTO>('/api/mentor-groups/join', data),

  getMyStudentGroups: () =>
    api.get<MentorGroupDTO[]>('/api/mentor-groups/me'),
};

// ==================== FILE STORAGE SERVICE ====================
export interface StoredFileDTO {
  fileId: number;
  ownerUserId: number;
  linkedEntityType: string;
  linkedEntityId?: number;
  originalFileName: string;
  contentType: string;
  fileExtension: string;
  fileSize: number;
  checksumSha256?: string;
  status: string;
  downloadUrl: string;
  createdAt: string;
}

export const fileService = {
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<StoredFileDTO>('/api/files/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  uploadGeneric: (file: File, linkedEntityType: string = 'GENERAL', linkedEntityId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('linkedEntityType', linkedEntityType);
    if (linkedEntityId !== undefined) {
      formData.append('linkedEntityId', String(linkedEntityId));
    }
    return api.post<StoredFileDTO>('/api/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getMetadata: (fileId: number) => api.get<StoredFileDTO>(`/api/files/${fileId}`),

  downloadFile: async (fileId: number, fallbackName?: string) => {
    const token = localStorage.getItem('token') || '';
    const response = await fetch(`/api/files/${fileId}/download`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }
    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition');
    let filename = fallbackName || `file_${fileId}`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

// ==================== MENTOR GROUP COLLABORATION ROOM SERVICE ====================

export type GroupMemberRole = 'OWNER' | 'CO_MENTOR' | 'LEADER' | 'MEMBER' | 'OBSERVER';
export type ChatMode = 'ALL_MEMBERS' | 'LEADER_ONLY' | 'MENTOR_ONLY' | 'MUTED';
export type SubmissionMode = 'LEADER_ONLY' | 'ANY_MEMBER' | 'MENTOR_ONLY';
export type TaskCreateMode = 'MENTOR_ONLY' | 'MENTOR_AND_LEADER';
export type GroupTaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED' | 'CANCELLED';
export type GroupTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type GroupSubmissionStatus = 'SUBMITTED' | 'REVIEWED' | 'NEEDS_CHANGES' | 'ACCEPTED' | 'REJECTED';

export interface GroupRoomSettingsDTO {
  groupId: number;
  chatMode: ChatMode;
  submissionMode: SubmissionMode;
  taskCreateMode: TaskCreateMode;
  allowAttachments: boolean;
  allowMemberInvite: boolean;
  messageEditWindowMinutes: number;
  autoReminderEnabled: boolean;
  updatedAt: string;
}

export interface GroupMessageAttachmentDTO {
  id: number;
  fileId: number;
  originalFileName: string;
  fileSize: number;
  contentType: string;
}

export interface GroupMessageDTO {
  messageId: number;
  groupId: number;
  senderUserId: number;
  senderName: string;
  senderRole?: string;
  senderAvatarUrl?: string;
  parentMessageId?: number;
  messageType: string;
  content: string;
  pinned: boolean;
  edited: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  attachments: GroupMessageAttachmentDTO[];
}

export interface GroupAnnouncementDTO {
  announcementId: number;
  groupId: number;
  authorUserId: number;
  authorName: string;
  authorAvatarUrl?: string;
  title: string;
  content: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  pinned: boolean;
  deadlineAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupTaskAssigneeDTO {
  studentId: number;
  studentCode: string;
  studentName: string;
  studentEmail: string;
  avatarUrl?: string;
}

export interface GroupTaskCommentDTO {
  commentId: number;
  authorUserId: number;
  authorName: string;
  authorRole?: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface GroupTaskDTO {
  taskId: number;
  groupId: number;
  creatorUserId: number;
  creatorName: string;
  title: string;
  description?: string;
  status: GroupTaskStatus;
  priority: GroupTaskPriority;
  deadlineAt?: string;
  locked: boolean;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  assignees: GroupTaskAssigneeDTO[];
  commentCount: number;
  comments: GroupTaskCommentDTO[];
}

export interface GroupSubmissionReviewDTO {
  reviewId: number;
  reviewerUserId: number;
  reviewerName: string;
  score: number;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupSubmissionDTO {
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
  status: GroupSubmissionStatus;
  submittedAt: string;
  reviews: GroupSubmissionReviewDTO[];
}

export interface GroupAuditLogDTO {
  auditId: number;
  groupId: number;
  actorUserId: number;
  actorName: string;
  actorRole?: string;
  action: string;
  targetType?: string;
  targetId?: number;
  metadataJson?: string;
  createdAt: string;
}

export interface GroupRoomOverviewDTO {
  groupId: number;
  groupName: string;
  groupCode: string;
  mentorId: number;
  mentorName: string;
  mentorEmail: string;
  phaseId: number;
  phaseName: string;
  description?: string;
  currentUserRoomRole: GroupMemberRole;
  isMuted: boolean;
  mutedUntil?: string;
  settings: GroupRoomSettingsDTO;
  memberCount: number;
  unreadMessageCount: number;
  activeTaskCount: number;
  overdueTaskCount: number;
  latestSubmission?: GroupSubmissionDTO;
  members: GroupMemberDTO[];
  pinnedAnnouncements: GroupAnnouncementDTO[];
}

export interface GroupRoomAdminDTO {
  groupId: number;
  groupName: string;
  groupCode: string;
  mentorId: number;
  mentorName: string;
  mentorEmail: string;
  phaseId: number;
  phaseName: string;
  isActive: boolean;
  memberCount: number;
  totalMessages: number;
  totalTasks: number;
  totalSubmissions: number;
  overdueTasks: number;
  settings: GroupRoomSettingsDTO;
  members: GroupMemberDTO[];
  recentAuditLogs: GroupAuditLogDTO[];
  createdAt: string;
  updatedAt: string;
}

export const groupRoomService = {
  getRoomOverview: (groupId: number) =>
    api.get<GroupRoomOverviewDTO>(`/api/mentor-groups/${groupId}/room`),

  getSettings: (groupId: number) =>
    api.get<GroupRoomSettingsDTO>(`/api/mentor-groups/${groupId}/settings`),

  updateSettings: (groupId: number, data: Partial<GroupRoomSettingsDTO>) =>
    api.put<GroupRoomSettingsDTO>(`/api/mentor-groups/${groupId}/settings`, data),

  updateMemberRole: (groupId: number, studentId: number, role: GroupMemberRole) =>
    api.patch<GroupMemberDTO>(`/api/mentor-groups/${groupId}/members/${studentId}/role`, { role }),

  removeMember: (groupId: number, studentId: number) =>
    api.delete<void>(`/api/mentor-groups/${groupId}/members/${studentId}`),

  muteMember: (groupId: number, studentId: number, isMuted: boolean, mutedMinutes?: number) =>
    api.patch<GroupMemberDTO>(`/api/mentor-groups/${groupId}/members/${studentId}/mute`, { isMuted, mutedMinutes }),

  // Messages
  getMessages: (groupId: number, page: number = 0, size: number = 50) =>
    api.get<any>(`/api/mentor-groups/${groupId}/messages?page=${page}&size=${size}`),

  getPinnedMessages: (groupId: number) =>
    api.get<GroupMessageDTO[]>(`/api/mentor-groups/${groupId}/messages/pinned`),

  sendMessage: (groupId: number, data: { content: string; parentMessageId?: number; attachmentFileIds?: number[] }) =>
    api.post<GroupMessageDTO>(`/api/mentor-groups/${groupId}/messages`, data),

  editMessage: (groupId: number, messageId: number, content: string) =>
    api.put<GroupMessageDTO>(`/api/mentor-groups/${groupId}/messages/${messageId}`, { content }),

  deleteMessage: (groupId: number, messageId: number) =>
    api.delete<void>(`/api/mentor-groups/${groupId}/messages/${messageId}`),

  pinMessage: (groupId: number, messageId: number, pinned: boolean = true) =>
    api.patch<GroupMessageDTO>(`/api/mentor-groups/${groupId}/messages/${messageId}/pin?pinned=${pinned}`),

  markMessageRead: (groupId: number, messageId: number) =>
    api.post<void>(`/api/mentor-groups/${groupId}/messages/${messageId}/read`),

  // Announcements
  getAnnouncements: (groupId: number) =>
    api.get<GroupAnnouncementDTO[]>(`/api/mentor-groups/${groupId}/announcements`),

  createAnnouncement: (groupId: number, data: { title: string; content: string; priority?: string; pinned?: boolean; deadlineAt?: string }) =>
    api.post<GroupAnnouncementDTO>(`/api/mentor-groups/${groupId}/announcements`, data),

  updateAnnouncement: (groupId: number, announcementId: number, data: Partial<GroupAnnouncementDTO>) =>
    api.put<GroupAnnouncementDTO>(`/api/mentor-groups/${groupId}/announcements/${announcementId}`, data),

  deleteAnnouncement: (groupId: number, announcementId: number) =>
    api.delete<void>(`/api/mentor-groups/${groupId}/announcements/${announcementId}`),

  // Tasks
  getTasks: (groupId: number, params?: { status?: string; assigneeId?: number; overdue?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.assigneeId) query.append('assigneeId', String(params.assigneeId));
    if (params?.overdue !== undefined) query.append('overdue', String(params.overdue));
    const queryString = query.toString();
    return api.get<GroupTaskDTO[]>(`/api/mentor-groups/${groupId}/tasks${queryString ? `?${queryString}` : ''}`);
  },

  createTask: (groupId: number, data: { title: string; description?: string; priority?: string; deadlineAt?: string; assigneeStudentIds?: number[]; assignAllMembers?: boolean; allowGroupSubmission?: boolean }) =>
    api.post<GroupTaskDTO>(`/api/mentor-groups/${groupId}/tasks`, data),

  getTask: (groupId: number, taskId: number) =>
    api.get<GroupTaskDTO>(`/api/mentor-groups/${groupId}/tasks/${taskId}`),

  updateTask: (groupId: number, taskId: number, data: Partial<GroupTaskDTO> & { assigneeStudentIds?: number[] }) =>
    api.put<GroupTaskDTO>(`/api/mentor-groups/${groupId}/tasks/${taskId}`, data),

  updateTaskStatus: (groupId: number, taskId: number, status: GroupTaskStatus) =>
    api.patch<GroupTaskDTO>(`/api/mentor-groups/${groupId}/tasks/${taskId}/status`, { status }),

  deleteTask: (groupId: number, taskId: number) =>
    api.delete<void>(`/api/mentor-groups/${groupId}/tasks/${taskId}`),

  addTaskComment: (groupId: number, taskId: number, content: string) =>
    api.post<GroupTaskCommentDTO>(`/api/mentor-groups/${groupId}/tasks/${taskId}/comments`, { content }),

  // Submissions
  getSubmissions: (groupId: number, taskId?: number) => {
    const query = taskId ? `?taskId=${taskId}` : '';
    return api.get<GroupSubmissionDTO[]>(`/api/mentor-groups/${groupId}/submissions${query}`);
  },

  submitGithub: (groupId: number, data: { taskId?: number; githubUrl: string; note?: string }) =>
    api.post<GroupSubmissionDTO>(`/api/mentor-groups/${groupId}/submissions/github`, data),

  submitZip: (groupId: number, file: File, taskId?: number, note?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (taskId !== undefined) formData.append('taskId', String(taskId));
    if (note) formData.append('note', note);
    return api.post<GroupSubmissionDTO>(`/api/mentor-groups/${groupId}/submissions/zip`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getSubmission: (groupId: number, submissionId: number) =>
    api.get<GroupSubmissionDTO>(`/api/mentor-groups/${groupId}/submissions/${submissionId}`),

  downloadSubmissionZip: async (groupId: number, submissionId: number, fallbackName?: string) => {
    const token = localStorage.getItem('token') || '';
    const response = await fetch(`/api/mentor-groups/${groupId}/submissions/${submissionId}/download`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }
    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition');
    let filename = fallbackName || `submission_${submissionId}.zip`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  reviewSubmission: (groupId: number, submissionId: number, data: { score: number; comment?: string; status?: string }) =>
    api.post<GroupSubmissionReviewDTO>(`/api/mentor-groups/${groupId}/submissions/${submissionId}/reviews`, data),

  // Admin Oversight
  getAllAdminRooms: (params?: { search?: string; phaseId?: number; active?: boolean; page?: number; size?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.phaseId !== undefined) query.append('phaseId', String(params.phaseId));
    if (params?.active !== undefined) query.append('active', String(params.active));
    if (params?.page !== undefined) query.append('page', String(params.page));
    if (params?.size !== undefined) query.append('size', String(params.size));
    const queryString = query.toString();
    return api.get<any>(`/api/admin/group-rooms${queryString ? `?${queryString}` : ''}`);
  },

  getAdminRoomDetail: (groupId: number) =>
    api.get<GroupRoomAdminDTO>(`/api/admin/group-rooms/${groupId}`),

  getAdminRoomAuditLogs: (groupId: number) =>
    api.get<GroupAuditLogDTO[]>(`/api/admin/group-rooms/${groupId}/audit-logs`),

  archiveRoom: (groupId: number) =>
    api.patch<void>(`/api/admin/group-rooms/${groupId}/archive`),

  reassignMentor: (groupId: number, mentorId: number) =>
    api.post<void>(`/api/admin/group-rooms/${groupId}/reassign-mentor`, { mentorId }),
};
