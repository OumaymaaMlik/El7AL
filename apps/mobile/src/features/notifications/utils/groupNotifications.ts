import type { TranslationKeys } from '../../../shared/i18n/translations';
import type { NotificationItem, NotificationMetadata } from '../store/useNotificationStore';

export interface GroupedChatNotification {
  isChat: true;
  id: string;
  /** Ids of every notification merged into this conversation entry. */
  ids: string[];
  type: 'CHAT';
  senderName: string;
  senderAvatar?: string | null;
  message: string;
  timestamp: string;
  createdAt?: string;
  unreadCount: number;
  isUnread: boolean;
  missionId?: string;
  metadata?: NotificationMetadata;
}

export interface SingleNotification extends NotificationItem {
  isChat: false;
}

export type DisplayNotification = GroupedChatNotification | SingleNotification;

export interface NotificationSectionData {
  key: string;
  title: string;
  items: DisplayNotification[];
}

type T = (key: TranslationKeys) => string;

function sectionFor(dateStr: string | undefined, t: T, language: string): { key: string; label: string } {
  const today = { key: 'today', label: t('today') || "Aujourd'hui" };
  if (!dateStr) return today;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return today;

  const now = new Date();
  if (date.toDateString() === now.toDateString()) return today;

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return { key: 'yesterday', label: t('yesterday') || 'Hier' };
  }

  const formatted = date.toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-FR', { day: 'numeric', month: 'short' });
  return { key: formatted, label: formatted };
}

/** Groups notifications into date sections and merges chat messages of the same conversation. */
export function groupNotifications(
  notifications: NotificationItem[],
  t: T,
  language: string,
): NotificationSectionData[] {
  const sections = new Map<string, DisplayNotification[]>();
  const labels = new Map<string, string>();

  for (const item of notifications) {
    const { key, label } = sectionFor(item.createdAt, t, language);
    labels.set(key, label);
    if (!sections.has(key)) sections.set(key, []);
    const items = sections.get(key)!;

    if (item.type !== 'CHAT') {
      items.push({ ...item, isChat: false });
      continue;
    }

    const group = items.find(
      (i): i is GroupedChatNotification =>
        i.isChat && (i.missionId === item.metadata?.missionId || i.senderName === (item.senderName || item.title)),
    );

    if (group) {
      group.ids.push(item.id);
      if (!item.read) {
        group.unreadCount += 1;
        group.isUnread = true;
      }
    } else {
      items.push({
        isChat: true,
        id: item.id,
        ids: [item.id],
        type: 'CHAT',
        senderName: item.senderName || item.title || 'Message',
        senderAvatar: item.senderAvatar || item.metadata?.senderAvatar,
        message: item.message,
        timestamp: item.timestamp,
        createdAt: item.createdAt,
        unreadCount: item.read ? 0 : 1,
        isUnread: !item.read,
        missionId: item.metadata?.missionId,
        metadata: item.metadata,
      });
    }
  }

  return [...sections.entries()].map(([key, items]) => ({ key, title: labels.get(key) || key, items }));
}
