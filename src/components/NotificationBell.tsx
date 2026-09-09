import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNotification, notificationService } from '../api/notificationService';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.allSettled([
        notificationService.getMyNotifications({ status: tab === 'UNREAD' ? 'UNREAD' : undefined }),
        notificationService.getUnreadCount(),
      ]);

      if (listRes.status === 'fulfilled' && Array.isArray(listRes.value)) {
        setNotifications(listRes.value);
      }
      if (countRes.status === 'fulfilled' && typeof countRes.value === 'number') {
        setUnreadCount(countRes.value);
      }
    } catch {
      // Do not fallback to fake mock data
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s near-realtime polling
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
    } catch {
      // Ignore
    }
    setNotifications((prev) =>
      prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch {
      // Ignore
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (n: AppNotification) => {
    if (!n.isRead) {
      handleMarkAsRead(n.notificationId, { stopPropagation: () => {} } as any);
    }
    setIsOpen(false);

    if (n.targetType === 'TASK' || n.targetType === 'GROUP_TASK') {
      navigate('/tasks');
    } else if (n.targetType === 'WEEKLY_REPORT') {
      navigate('/weekly-reports');
    } else if (n.targetType === 'APPLICATION') {
      navigate('/applications');
    } else if (n.targetType === 'ASSESSMENT_RESULT') {
      navigate('/assessment-results');
    } else if (n.targetType === 'GROUP') {
      navigate('/groups');
    } else {
      navigate('/dashboard');
    }
  };

  const filteredList = tab === 'UNREAD'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
        aria-label="Thông báo"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Thông Báo</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-[#004ac6] dark:text-blue-400 hover:underline cursor-pointer"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setTab('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                tab === 'ALL'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-300 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setTab('UNREAD')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                tab === 'UNREAD'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#004ac6] dark:text-blue-300 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">Đang tải thông báo...</div>
            ) : filteredList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
                {tab === 'UNREAD' ? 'Không có thông báo chưa đọc nào' : 'Không có thông báo nào'}
              </div>
            ) : (
              filteredList.map((n) => (
                <div
                  key={n.notificationId}
                  onClick={() => handleNotificationClick(n)}
                  className={`group flex items-start justify-between gap-3 p-3.5 cursor-pointer transition-colors ${
                    n.isRead
                      ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      : 'bg-blue-50/40 dark:bg-blue-950/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/50'
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-[#004ac6] dark:bg-blue-400 shrink-0" />}
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">{n.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      {new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      type="button"
                      title="Đánh dấu đã đọc"
                      onClick={(e) => handleMarkAsRead(n.notificationId, e)}
                      className="rounded p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
