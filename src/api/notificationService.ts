import { api } from './apiClient';

export type NotificationType =
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'ASSIGNMENT_CREATED'
  | 'WEEKLY_REPORT_SUBMITTED'
  | 'WEEKLY_REPORT_REVIEWED'
  | 'WEEKLY_REPORT_DUE_SOON'
  | 'WEEKLY_REPORT_OVERDUE'
  | 'ASSESSMENT_ROUND_STARTED'
  | 'ASSESSMENT_SCORE_SUBMITTED'
  | 'ASSESSMENT_RESULT_PUBLISHED'
  | 'GROUP_TASK_CREATED'
  | 'GROUP_TASK_DUE_SOON'
  | 'GROUP_TASK_OVERDUE'
  | 'GROUP_SUBMISSION_CREATED'
  | 'GROUP_SUBMISSION_REVIEWED'
  | 'GROUP_MEMBER_ROLE_UPDATED'
  | 'GROUP_MEMBER_MUTED'
  | 'GROUP_MEMBER_REMOVED';

export interface AppNotification {
  notificationId: number;
  recipientId: number;
  title: string;
  message: string;
  type: NotificationType;
  targetType?: string;
  targetId?: number;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface GetNotificationsParams {
  status?: 'ALL' | 'UNREAD' | 'READ';
  type?: NotificationType;
  page?: number;
  size?: number;
}

export const notificationService = {
  getMyNotifications: async (params?: GetNotificationsParams): Promise<AppNotification[]> => {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page !== undefined) searchParams.set('page', String(params.page));
    if (params?.size !== undefined) searchParams.set('size', String(params.size));
    const query = searchParams.toString();
    const url = `/api/me/notifications${query ? `?${query}` : ''}`;
    const res = await api.get<any>(url);
    if (res && Array.isArray(res.content)) {
      return res.content;
    }
    return Array.isArray(res) ? res : [];
  },

  getUnreadCount: async (): Promise<number> => {
    return api.get<number>('/api/me/notifications/unread-count');
  },

  markAsRead: async (id: number): Promise<AppNotification> => {
    return api.patch<AppNotification>(`/api/me/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/api/me/notifications/read-all');
  },

  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/api/me/notifications/${id}`);
  },
};
