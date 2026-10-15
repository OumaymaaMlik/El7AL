import { create } from 'zustand';
import type { ReviewData } from '../../missions/types';

export type NotificationType = 'CHAT' | 'OFFER' | 'ACCEPT' | 'CANCEL' | 'COMPLETED' | 'SYSTEM';

/** Visual tone of a toast. Notifications from the server are always 'info'. */
export type ToastTone = 'info' | 'success' | 'error';

/** What a notification carries so tapping it can open the right screen. */
export interface NotificationMetadata {
  missionId?: string;
  senderName?: string;
  senderAvatar?: string | null;
  reviewData?: ReviewData;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  createdAt?: string;
  read: boolean;
  metadata?: NotificationMetadata;
  tone?: ToastTone;
  senderName?: string;
  senderAvatar?: string | null;
}

interface NotificationState {
  notifications: NotificationItem[];
  activeToast: NotificationItem | null;
  unreadCount: number;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read' | 'createdAt'>) => void;
  flashToast: (toast: { title: string; message?: string; tone?: ToastTone }) => void;
  dismissToast: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const makeId = () => Math.random().toString(36).substring(2, 9);
const nowLabel = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  activeToast: null,
  unreadCount: 0,

  addNotification: (item) => {
    const newItem: NotificationItem = {
      ...item,
      id: makeId(),
      timestamp: nowLabel(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    set((state) => ({
      notifications: [newItem, ...state.notifications],
      activeToast: newItem,
      unreadCount: state.unreadCount + 1,
    }));
  },

  flashToast: ({ title, message = '', tone = 'info' }) => {
    set({
      activeToast: {
        id: makeId(),
        title,
        message,
        type: 'SYSTEM',
        timestamp: nowLabel(),
        createdAt: new Date().toISOString(),
        read: true,
        tone,
      },
    });
  },

  dismissToast: () => {
    set({ activeToast: null });
  },

  markAsRead: (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return {
        notifications: updated,
        unreadCount: Math.max(0, updated.filter((n) => !n.read).length),
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0, activeToast: null });
  },
}));
