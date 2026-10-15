import type { Language } from '../store/useLanguageStore';
import { useLanguageStore } from '../store/useLanguageStore';

interface NotificationCopy {
  // Notification centre
  title: string;
  unread: (n: number) => string;
  markAll: string;
  clearAll: string;
  clearConfirm: string;
  cancel: string;
  clear: string;
  empty: string;
  emptyText: string;
  today: string;
  yesterday: string;
  close: string;
  bell: (n: number) => string;
  message: string;
  // The notifications themselves
  accepted: (name: string) => { title: string; text: string };
  enRoute: (name: string, eta?: number) => { title: string; text: string };
  arrived: (name: string) => { title: string; text: string };
  confirmEnd: { title: string; text: string };
  delay: (eta: number) => { title: string; text: string };
  cancelledByArtisan: (reason?: string) => { title: string; text: string };
  cancelledByClient: (reason?: string) => { title: string; text: string };
  completedPro: { title: string; text: string };
  review: (rating: number, comment: string, client: string) => { title: string; text: string };
  newOffer: (category: string) => string;
  newOfferText: (client: string, address: string) => string;
  accountVerified: { title: string; text: string };
  accountRefused: (note: string) => { title: string; text: string };
  // The window of a review
  reviewWindow: { title: string; from: string; rating: string; comment: string; noComment: string; close: string };
}

const fr: NotificationCopy = {
  title: 'Notifications',
  unread: (n) => `${n} non lue${n > 1 ? 's' : ''}`,
  markAll: 'Tout marquer comme lu',
  clearAll: 'Tout effacer',
  clearConfirm: 'Effacer toutes les notifications ?',
  cancel: 'Annuler',
  clear: 'Effacer',
  empty: 'Aucune notification',
  emptyText: 'Vous êtes à jour, rien à signaler.',
  today: "Aujourd'hui",
  yesterday: 'Hier',
  close: 'Fermer',
  bell: (n) => (n > 0 ? `Notifications (${n} non lues)` : 'Notifications'),
  message: 'Message',
  accepted: (n) => ({ title: 'Artisan en route !', text: `${n} a accepté votre demande.` }),
  enRoute: (n, eta) => ({
    title: `${n} est en route`,
    text: eta ? `Arrivée dans ${eta} min.` : 'Votre artisan est en chemin.',
  }),
  arrived: (n) => ({ title: `${n} est arrivé`, text: 'Il est sur place.' }),
  confirmEnd: { title: 'Travaux terminés', text: "Confirmez la fin de l'intervention." },
  delay: (eta) => ({ title: 'Retard de votre artisan', text: `Arrivée estimée dans ${eta} min.` }),
  cancelledByArtisan: (r) => ({
    title: "Intervention annulée par l'artisan",
    text: r || "L'artisan a annulé l'intervention.",
  }),
  cancelledByClient: (r) => ({
    title: 'Mission annulée par le client',
    text: r || "Le client a annulé l'intervention.",
  }),
  completedPro: { title: 'Mission terminée', text: 'Commission de 30 TND prélevée.' },
  review: (rating, comment, client) => ({
    title: `Nouvel avis · ${rating}/5`,
    text: comment || `${client} a noté votre intervention.`,
  }),
  newOffer: (c) => `Nouvelle demande (${c})`,
  newOfferText: (c, a) => `${c} · ${a}`,
  accountVerified: {
    title: 'Compte vérifié',
    text: 'Vous pouvez maintenant passer en ligne et recevoir des demandes.',
  },
  accountRefused: (n) => ({ title: 'Vérification refusée', text: n || 'Votre dossier a été refusé.' }),
  reviewWindow: {
    title: 'Avis du client',
    from: 'Client',
    rating: 'Note',
    comment: 'Son commentaire',
    noComment: "Le client n'a pas écrit de commentaire.",
    close: 'Fermer',
  },
};

const en: NotificationCopy = {
  title: 'Notifications',
  unread: (n) => `${n} unread`,
  markAll: 'Mark all as read',
  clearAll: 'Clear all',
  clearConfirm: 'Clear all notifications?',
  cancel: 'Cancel',
  clear: 'Clear',
  empty: 'No notifications',
  emptyText: 'You are up to date, nothing to report.',
  today: 'Today',
  yesterday: 'Yesterday',
  close: 'Close',
  bell: (n) => (n > 0 ? `Notifications (${n} unread)` : 'Notifications'),
  message: 'Message',
  accepted: (n) => ({ title: 'Your pro is on the way!', text: `${n} accepted your request.` }),
  enRoute: (n, eta) => ({
    title: `${n} is on the way`,
    text: eta ? `Arriving in ${eta} min.` : 'Your pro is on the way.',
  }),
  arrived: (n) => ({ title: `${n} has arrived`, text: 'They are on site.' }),
  confirmEnd: { title: 'Work finished', text: 'Please confirm the end of the job.' },
  delay: (eta) => ({ title: 'Your pro is running late', text: `Estimated arrival in ${eta} min.` }),
  cancelledByArtisan: (r) => ({ title: 'Job cancelled by the pro', text: r || 'The pro cancelled the job.' }),
  cancelledByClient: (r) => ({ title: 'Job cancelled by the customer', text: r || 'The customer cancelled the job.' }),
  completedPro: { title: 'Job completed', text: 'Commission of 30 TND taken.' },
  review: (rating, comment, client) => ({
    title: `New review · ${rating}/5`,
    text: comment || `${client} rated your job.`,
  }),
  newOffer: (c) => `New request (${c})`,
  newOfferText: (c, a) => `${c} · ${a}`,
  accountVerified: { title: 'Account verified', text: 'You can now go online and receive requests.' },
  accountRefused: (n) => ({ title: 'Verification refused', text: n || 'Your file was refused.' }),
  reviewWindow: {
    title: "Customer's review",
    from: 'Customer',
    rating: 'Rating',
    comment: 'Their comment',
    noComment: 'The customer did not write a comment.',
    close: 'Close',
  },
};

const ar: NotificationCopy = {
  title: 'الإشعارات',
  unread: (n) => `${n} غير مقروء`,
  markAll: 'تعليم الكل كمقروء',
  clearAll: 'مسح الكل',
  clearConfirm: 'مسح كل الإشعارات؟',
  cancel: 'إلغاء',
  clear: 'مسح',
  empty: 'لا توجد إشعارات',
  emptyText: 'أنت على اطلاع، لا جديد.',
  today: 'اليوم',
  yesterday: 'أمس',
  close: 'إغلاق',
  bell: (n) => (n > 0 ? `الإشعارات (${n} غير مقروءة)` : 'الإشعارات'),
  message: 'رسالة',
  accepted: (n) => ({ title: 'الحرفي في الطريق!', text: `${n} قبل طلبك.` }),
  enRoute: (n, eta) => ({ title: `${n} في الطريق`, text: eta ? `يصل خلال ${eta} د.` : 'حرفيك في الطريق إليك.' }),
  arrived: (n) => ({ title: `${n} وصل`, text: 'هو الآن في المكان.' }),
  confirmEnd: { title: 'انتهت الأشغال', text: 'يرجى تأكيد نهاية التدخّل.' },
  delay: (eta) => ({ title: 'تأخر الحرفي', text: `الوصول المقدّر خلال ${eta} د.` }),
  cancelledByArtisan: (r) => ({ title: 'ألغى الحرفي التدخّل', text: r || 'ألغى الحرفي التدخّل.' }),
  cancelledByClient: (r) => ({ title: 'ألغى الزبون المهمة', text: r || 'ألغى الزبون التدخّل.' }),
  completedPro: { title: 'مهمة منتهية', text: 'تم خصم عمولة 30 د.ت.' },
  review: (rating, comment, client) => ({
    title: `تقييم جديد · ${rating}/5`,
    text: comment || `${client} قيّم تدخّلك.`,
  }),
  newOffer: (c) => `طلب جديد (${c})`,
  newOfferText: (c, a) => `${c} · ${a}`,
  accountVerified: { title: 'تم التحقق من حسابك', text: 'يمكنك الآن تفعيل الاتصال واستقبال الطلبات.' },
  accountRefused: (n) => ({ title: 'تم رفض التحقق', text: n || 'تم رفض ملفك.' }),
  reviewWindow: {
    title: 'تقييم الزبون',
    from: 'الزبون',
    rating: 'التقييم',
    comment: 'تعليقه',
    noComment: 'لم يكتب الزبون تعليقاً.',
    close: 'إغلاق',
  },
};

const notificationCopy: Record<Language, NotificationCopy> = { fr, en, ar };

export function useNotificationCopy(): NotificationCopy {
  const language = useLanguageStore((s) => s.language);
  return notificationCopy[language] ?? notificationCopy.fr;
}
