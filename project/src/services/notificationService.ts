// src/services/notificationService.ts

import api from '../axiosInstance';
import { Notification } from '../types';

export const notificationService = {
  // Fetch all notifications
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get<Notification[]>('config/notifications/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch notifications');
    }
  },

  // Mark a single notification as read
  markNotificationAsRead: async (id: string): Promise<void> => {
    try {
      await api.patch(`config/notifications/${id}/read/`, { isRead: true });
    } catch (error) {
      throw new Error('Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async (): Promise<void> => {
    try {
      await api.patch('config/notifications/read-all/');
    } catch (error) {
      throw new Error('Failed to mark all notifications as read');
    }
  },

  // Delete a notification
  deleteNotification: async (id: string): Promise<void> => {
    try {
      await api.delete(`config/notifications/${id}/`);
    } catch (error) {
      throw new Error('Failed to delete notification');
    }
  },
};