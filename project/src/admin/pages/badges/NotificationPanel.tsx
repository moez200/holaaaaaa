// src/pages/badges/NotificationPanel.tsx
import React, { useState, useEffect } from 'react';

import { Award, Bell, Gift, Info, MoreVertical, Check } from 'lucide-react';
import { notificationService } from '../../../services/notificationService';
import { Notification } from '../../../types';

const NotificationPanel: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await notificationService.getNotifications();
        setNotifications(data);
      } catch (err) {
        setError('Failed to load notifications. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      setNotifications(notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })));
    } catch (err) {
      setError('Failed to mark all notifications as read.');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markNotificationAsRead(id);
      setNotifications(notifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
    } catch (err) {
      setError('Failed to mark notification as read.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter((notification) => notification.id !== id));
    } catch (err) {
      setError('Failed to delete notification.');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'badge': return <Award size={18} className="text-purple-400" />;
      case 'referral': return <Gift size={18} className="text-indigo-400" />;
      case 'system': return <Info size={18} className="text-blue-400" />;
      default: return <Bell size={18} className="text-gray-400" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-sm">{error}</div>
      )}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800 text-lg">Notifications</h3>
        <button
          onClick={handleMarkAllAsRead}
          className="text-sm text-purple-500 hover:text-purple-600 font-medium"
          disabled={isLoading || notifications.every((n) => n.isRead)}
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="py-8 px-4 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors duration-150 ${
                  !notification.isRead ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      !notification.isRead ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${
                      !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.date)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2 relative group">
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <MoreVertical size={16} className="text-gray-400" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg border border-gray-100 w-44 py-1 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 z-10">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2"
                        >
                          <Check size={16} />
                          <span>Mark as read</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 text-center">
        <button
          onClick={onClose}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;