import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { ServerEvents } from '@el7al/shared';
import { getSocket } from '../../services/socket';
import { onServerEvent } from '../../services/serverEvents';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useNotificationCopy } from '../../lib/notificationCopy';
import { useProviderStore } from '../../store/useProviderStore';

/**
 * Turns what the server pushes into notifications, on every page. Renders nothing.
 *
 * Rules (the server sends each event once, to the right people; this decides what is worth saying):
 *  - a person is never notified of what they did themselves;
 *  - status chat lines ("Je suis en route") are not chat notifications, the status one says it;
 *  - nothing for search progress, "taken by someone else" or an offer withdrawn (the pop-up just closes).
 */
export const NotificationBridge: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const add = useNotificationStore((s) => s.addNotification);
  const c = useNotificationCopy();
  const { pathname, search } = useLocation();
  const isProvider = user?.role === 'PROVIDER';
  const isClient = user?.role === 'CLIENT';
  const trackingUrl = isProvider ? '/provider/tracking' : '/client/tracking';

  // The handlers read the latest page and language without re-subscribing at every navigation.
  const latest = useRef({ pathname, search, c });
  latest.current = { pathname, search, c };

  useEffect(() => {
    if (!user?.id || (!isProvider && !isClient)) return;
    const socket = getSocket();
    const withId = (id?: string) => (id ? `${trackingUrl}?id=${id}` : trackingUrl);
    const text = () => latest.current.c;

    // ----- Artisan
    const onOffer = (d: ServerEvents['mission:new_offer']) =>
      add({
        kind: 'OFFER',
        quiet: true, // the pop-up already shows it
        title: text().newOffer(d.categoryName || 'Intervention'),
        message: text().newOfferText(d.clientName || 'El 7al', d.addressText || ''),
        type: 'warning',
        actionUrl: '/provider/home',
        missionId: d.missionId,
      });

    const onCompleted = (d: ServerEvents['mission:completed']) => {
      if (!isProvider) return; // the client just confirmed it themselves
      const t = text().completedPro;
      add({
        kind: 'COMPLETED',
        title: t.title,
        message: t.text,
        type: 'success',
        actionUrl: '/provider/home',
        missionId: d?.missionId,
      });
    };

    const onReviewed = (d: ServerEvents['mission:reviewed']) => {
      if (!isProvider) return;
      const rating = Number(d?.rating) || 0;
      const comment = typeof d?.comment === 'string' ? d.comment.trim() : '';
      const clientName = d?.clientName || 'Client El 7al';
      const t = text().review(rating, comment, clientName);
      add({
        kind: 'REVIEW',
        title: t.title,
        message: t.text,
        type: 'success',
        missionId: d?.missionId,
        review: { missionId: d?.missionId, rating, comment, clientName },
      });
    };

    // An admin approved or refused the artisan's identity check.
    const onVerification = (d: ServerEvents['account:verification']) => {
      if (!isProvider) return;
      const status = d?.status === 'ACTIVE' ? 'ACTIVE' : 'REJECTED';
      useProviderStore.getState().applyVerification(status, d?.note ?? null);
      const t = status === 'ACTIVE' ? text().accountVerified : text().accountRefused(d?.note ?? '');
      add({
        kind: 'SYSTEM',
        title: t.title,
        message: t.text,
        type: status === 'ACTIVE' ? 'success' : 'danger',
        actionUrl: '/provider/home',
      });
    };

    // ----- Client
    const onAccepted = (d: ServerEvents['mission:accepted']) => {
      if (!isClient) return; // the artisan who accepted does not need to be told
      const t = text().accepted(d?.provider?.fullName || '');
      add({
        kind: 'ACCEPT',
        title: t.title,
        message: t.text,
        type: 'success',
        actionUrl: withId(d?.missionId),
        missionId: d?.missionId,
      });
    };

    const onStatus = (d: ServerEvents['mission:status_update']) => {
      if (!isClient) return; // the artisan makes these changes
      const name = d?.providerName || '';
      let t: { title: string; text: string } | null = null;
      if (d?.status === 'EN_ROUTE')
        t = text().enRoute(name, typeof d.etaMinutes === 'number' ? d.etaMinutes : undefined);
      else if (d?.status === 'ARRIVED') t = text().arrived(name);
      else if (d?.status === 'DUAL_CONFIRM') t = text().confirmEnd;
      if (t)
        add({
          kind: 'STATUS',
          title: t.title,
          message: t.text,
          type: d.status === 'DUAL_CONFIRM' ? 'warning' : 'info',
          actionUrl: withId(d?.missionId),
          missionId: d?.missionId,
        });
    };

    const onDelay = (d: ServerEvents['mission:delay_alert']) => {
      if (!isClient || typeof d?.etaMinutes !== 'number') return;
      const t = text().delay(d.etaMinutes);
      add({
        kind: 'STATUS',
        title: t.title,
        message: t.text,
        type: 'warning',
        actionUrl: withId(d?.missionId),
        missionId: d?.missionId,
      });
    };

    // ----- Both
    const onCancelled = (d: ServerEvents['mission:cancelled']) => {
      // Only for the other person, and only when the job was really under way.
      if (!d?.wasAccepted) return;
      if (d.cancelledBy === (isProvider ? 'PROVIDER' : 'CLIENT')) return;
      const t = isProvider ? text().cancelledByClient(d.reason) : text().cancelledByArtisan(d.reason);
      add({
        kind: 'CANCEL',
        title: t.title,
        message: t.text,
        type: 'danger',
        actionUrl: isProvider ? '/provider/home' : '/client/home',
        missionId: d.missionId,
      });
    };

    const onChat = (m: ServerEvents['chat:receive']) => {
      if (!m || m.system || m.senderId === user.id) return;
      const { pathname: path, search: query } = latest.current;
      // The conversation is on screen when this job's tracking page is open.
      if (path === trackingUrl && (!m.missionId || query.includes(m.missionId))) return;
      add({
        kind: 'CHAT',
        title: m.senderName || text().message,
        message: m.content || '',
        type: 'info',
        senderName: m.senderName || text().message,
        senderAvatar: m.senderAvatar,
        missionId: m.missionId,
        actionUrl: withId(m.missionId),
      });
    };

    const stops = [
      onServerEvent(socket, 'account:verification', onVerification),
      onServerEvent(socket, 'mission:new_offer', onOffer),
      onServerEvent(socket, 'mission:accepted', onAccepted),
      onServerEvent(socket, 'mission:status_update', onStatus),
      onServerEvent(socket, 'mission:delay_alert', onDelay),
      onServerEvent(socket, 'mission:completed', onCompleted),
      onServerEvent(socket, 'mission:cancelled', onCancelled),
      onServerEvent(socket, 'mission:reviewed', onReviewed),
      onServerEvent(socket, 'chat:receive', onChat),
    ];
    return () => stops.forEach((stop) => stop());
  }, [user?.id, isProvider, isClient, trackingUrl, add]);

  return null;
};
