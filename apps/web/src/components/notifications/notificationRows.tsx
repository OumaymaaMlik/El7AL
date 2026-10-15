import React from 'react';
import { AlertTriangle, Bell, CheckCircle2, MessageSquare, Navigation, Star, XCircle, Zap } from 'lucide-react';
import type { AppNotification, NotificationKind } from '../../store/useNotificationStore';

const ICONS: Record<NotificationKind, React.ElementType> = {
  CHAT: MessageSquare,
  OFFER: Zap,
  ACCEPT: CheckCircle2,
  STATUS: Navigation,
  REVIEW: Star,
  CANCEL: XCircle,
  COMPLETED: CheckCircle2,
  SYSTEM: Bell,
};

/** One row of the centre: a chat conversation (messages of a mission merged) or a single notification. */
export type Row =
  | {
      chat: true;
      id: string;
      ids: string[];
      name: string;
      avatar?: string | null;
      message: string;
      at: Date;
      unread: number;
      url?: string;
    }
  | { chat: false; item: AppNotification };

export function groupByDay(list: AppNotification[], today: string, yesterday: string, locale: string) {
  const sections = new Map<string, Row[]>();
  const now = new Date();
  const yest = new Date();
  yest.setDate(now.getDate() - 1);

  for (const n of list) {
    const day = new Date(n.timestamp);
    const label =
      day.toDateString() === now.toDateString()
        ? today
        : day.toDateString() === yest.toDateString()
          ? yesterday
          : day.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    if (!sections.has(label)) sections.set(label, []);
    const rows = sections.get(label)!;

    if (n.kind !== 'CHAT') {
      rows.push({ chat: false, item: n });
      continue;
    }
    const existing = rows.find(
      (r): r is Extract<Row, { chat: true }> => r.chat && (r.id === `chat-${n.missionId}` || r.name === n.senderName),
    );
    if (existing) {
      existing.ids.push(n.id);
      if (!n.read) existing.unread += 1;
    } else {
      rows.push({
        chat: true,
        id: `chat-${n.missionId ?? n.id}`,
        ids: [n.id],
        name: n.senderName || n.title,
        avatar: n.senderAvatar,
        message: n.message,
        at: n.timestamp,
        unread: n.read ? 0 : 1,
        url: n.actionUrl,
      });
    }
  }
  return [...sections.entries()];
}

const toneClasses = (n: AppNotification) => {
  if (n.type === 'danger' || n.kind === 'CANCEL')
    return {
      box: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
      Icon: n.kind === 'CANCEL' ? XCircle : AlertTriangle,
    };
  if (n.type === 'success')
    return {
      box: 'bg-brand-accent/40 text-brand-500 dark:bg-brand-accent/20 dark:text-brand-accent',
      Icon: ICONS[n.kind ?? 'SYSTEM'],
    };
  if (n.type === 'warning')
    return {
      box: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      Icon: ICONS[n.kind ?? 'SYSTEM'],
    };
  return { box: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300', Icon: ICONS[n.kind ?? 'SYSTEM'] };
};

export const time = (d: Date, locale: string) =>
  new Date(d).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

const ROW = 'w-full text-start flex items-center gap-3 px-4 py-3.5 hover:opacity-90';
const UNREAD_BG = 'bg-lime-50 dark:bg-emerald-950/40';

/** A conversation: the messages of one mission merged into one line with an unread counter. */
export const ChatRow: React.FC<{ row: Extract<Row, { chat: true }>; locale: string; onOpen: () => void }> = ({
  row,
  locale,
  onOpen,
}) => (
  <li>
    <button type="button" onClick={onOpen} className={`${ROW} ${row.unread > 0 ? UNREAD_BG : ''}`}>
      <span className="relative w-11 h-11 shrink-0">
        <span className="w-11 h-11 rounded-full grid place-items-center overflow-hidden bg-brand-500 text-white font-display font-bold">
          {row.avatar ? (
            <img src={row.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            row.name.charAt(0).toUpperCase()
          )}
        </span>
        <span className="absolute -end-1 -bottom-1 w-5 h-5 rounded-full grid place-items-center bg-brand-accent border-2 border-white dark:border-dark-card">
          <MessageSquare className="w-2.5 h-2.5 text-brand-on-accent" strokeWidth={3} aria-hidden="true" />
        </span>
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-baseline justify-between gap-2">
          <b className="truncate text-[15px]">{row.name}</b>
          <span className="text-xs text-slate-600 dark:text-slate-400 shrink-0">{time(row.at, locale)}</span>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-slate-700 dark:text-slate-300">{row.message}</span>
          {row.unread > 0 && (
            <span className="min-w-[22px] h-[22px] px-1.5 rounded-full grid place-items-center bg-brand-500 text-white text-xs font-bold">
              {row.unread > 99 ? '99+' : row.unread}
            </span>
          )}
        </span>
      </span>
    </button>
  </li>
);

/** A single notification: coloured icon, title, text, time, and a dot while unread. */
export const ItemRow: React.FC<{ item: AppNotification; locale: string; onOpen: () => void }> = ({
  item: n,
  locale,
  onOpen,
}) => {
  const { box, Icon } = toneClasses(n);
  return (
    <li>
      <button type="button" onClick={onOpen} className={`${ROW} ${n.read ? '' : UNREAD_BG}`}>
        <span className={`w-11 h-11 shrink-0 rounded-[14px] grid place-items-center ${box}`}>
          <Icon className="w-[22px] h-[22px]" aria-hidden="true" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-baseline justify-between gap-2">
            <b className="truncate text-[15px]">{n.title}</b>
            <span className="text-xs text-slate-600 dark:text-slate-400 shrink-0">{time(n.timestamp, locale)}</span>
          </span>
          {n.message && <span className="block truncate text-sm text-slate-700 dark:text-slate-300">{n.message}</span>}
        </span>
        {!n.read && (
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500 dark:bg-brand-accent shrink-0" aria-hidden="true" />
        )}
      </button>
    </li>
  );
};
