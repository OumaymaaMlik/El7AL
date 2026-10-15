import { create } from 'zustand';

/** What a stored notification is about (drives its icon and, for chat, the grouping). */
export type NotificationKind = 'CHAT' | 'OFFER' | 'ACCEPT' | 'STATUS' | 'CANCEL' | 'COMPLETED' | 'REVIEW' | 'SYSTEM';
type Tone = 'info' | 'success' | 'warning' | 'danger';

/** What the artisan sees when opening a review notification. */
export interface ReviewPayload {
  missionId?: string;
  rating: number;
  comment: string;
  clientName: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  /** Visual tone of the toast and of the icon. */
  type: Tone;
  timestamp: Date;
  read: boolean;
  /** Only notifications with a kind are kept in the notification centre. */
  kind?: NotificationKind;
  /** Where a click leads (a page). Review notifications open a window instead, see `review`. */
  actionUrl?: string;
  senderName?: string;
  senderAvatar?: string | null;
  missionId?: string;
  /** Set on review notifications: opened in a window with the rating and the comment. */
  review?: ReviewPayload;
  /** Stored in the centre without a toast (the pop-up of a new offer already says it). */
  quiet?: boolean;
}

type NewNotification = Omit<AppNotification, 'id' | 'timestamp' | 'read'>;

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  toast: AppNotification | null;
  /** The review whose window is open. */
  openReview: ReviewPayload | null;
  /**
   * Shows a toast. With a `kind` it is also kept in the notification centre (news from the server);
   * without one it is a passing confirmation ("profile saved") and leaves no trace.
   */
  addNotification: (notification: NewNotification) => void;
  markAsRead: (id: string | string[]) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  clearToast: () => void;
  /** Opens (or with null closes) the window of a review. */
  showReview: (review: ReviewPayload | null) => void;
}

const makeId = () => Math.random().toString(36).substring(2, 9);
const unread = (list: AppNotification[]) => list.filter((n) => !n.read).length;

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  toast: null,
  openReview: null,

  addNotification: (item) => {
    const created: AppNotification = { ...item, id: makeId(), timestamp: new Date(), read: !item.kind };
    set((state) => {
      if (!created.kind) return { toast: created };
      const notifications = [created, ...state.notifications].slice(0, 100);
      return { notifications, unreadCount: unread(notifications), ...(created.quiet ? {} : { toast: created }) };
    });
  },

  markAsRead: (id) =>
    set((state) => {
      const ids = Array.isArray(id) ? id : [id];
      const notifications = state.notifications.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n));
      return { notifications, unreadCount: unread(notifications) };
    }),

  markAllAsRead: () =>
    set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })), unreadCount: 0 })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0, toast: null }),

  clearToast: () => set({ toast: null }),

  showReview: (review) => set({ openReview: review }),
}));
