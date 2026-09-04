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
  | 'ASSESSMENT_RESULT_PUBLISHED';

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

export const notificationService = {
  getMyNotifications: async (): Promise<AppNotification[]> => {
    return api.get<AppNotification[]>('/api/notifications');
  },

  getUnreadCount: async (): Promise<number> => {
    return api.get<number>('/api/notifications/unread-count');
  },

  markAsRead: async (id: number): Promise<AppNotification> => {
    return api.put<AppNotification>(`/api/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/api/notifications/read-all');
  },

  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/api/notifications/${id}`);
  },
};
