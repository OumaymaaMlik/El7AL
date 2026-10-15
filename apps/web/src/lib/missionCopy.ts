import type { Language } from '../store/useLanguageStore';
import { useLanguageStore } from '../store/useLanguageStore';

/** The six stages of a running mission, in order: what the client and the artisan both see. */
export const STAGE_ORDER = ['BROADCASTED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS', 'DUAL_CONFIRM'] as const;

/** Position of a status in the six stages (CREATED counts as searching). */
export function stageIndex(status?: string | null): number {
  const i = STAGE_ORDER.indexOf((status === 'CREATED' ? 'BROADCASTED' : status) as (typeof STAGE_ORDER)[number]);
  return i < 0 ? 0 : i;
}

interface MissionCopy {
  stages: string[];
  headline: Record<(typeof STAGE_ORDER)[number], (name: string) => string>;
  liveTag: string;
  stepOf: (n: number) => string;
  next: string;
  follow: string;
  cancel: string;
  cancelMessage: string;
  back: string;
  relaunch: string;
  call: string;
  historyLabel: string;
  historyTitle: string;
  done: string;
  cancelled: string;
  hello: (name: string) => string;
  artisanFallback: string;
  details: {
    title: string;
    open: string;
    date: string;
    duration: string;
    minutes: (n: number) => string;
    address: string;
    problem: string;
    noProblem: string;
    artisan: string;
    noArtisan: string;
    review: string;
    noReview: string;
    reason: string;
    byYou: string;
    byArtisan: string;
    client: string;
    reviewReceived: string;
    noReviewReceived: string;
    byClient: string;
    youCancelled: string;
    reference: string;
    close: string;
  };
}

const missionCopy: Record<Language, MissionCopy> = {
  fr: {
    stages: ['Recherche', 'Accepté', 'En route', 'Sur place', 'En cours', 'Fin des travaux'],
    headline: {
      BROADCASTED: () => 'Nous cherchons un artisan près de vous',
      ACCEPTED: (n) => `${n} a accepté votre demande`,
      EN_ROUTE: (n) => `${n} est en route`,
      ARRIVED: (n) => `${n} est arrivé chez vous`,
      IN_PROGRESS: () => 'Les travaux ont commencé',
      DUAL_CONFIRM: () => 'Confirmez la fin des travaux',
    },
    liveTag: 'Intervention en cours',
    stepOf: (n) => `Étape ${n} sur 6`,
    next: 'Ensuite',
    follow: 'Suivre en direct',
    cancel: 'Annuler la demande',
    cancelMessage: "L'artisan sera prévenu et la recherche s'arrêtera.",
    back: 'Retour',
    relaunch: 'Relancer',
    call: 'Appeler',
    historyLabel: 'Historique',
    historyTitle: 'Dernières interventions',
    done: 'Terminé',
    cancelled: 'Annulée',
    hello: (n) => `Bonjour ${n}`,
    artisanFallback: 'Artisan',
    details: {
      title: "Détails de l'intervention",
      open: 'Voir le détail',
      date: 'Demandée le',
      duration: 'Durée des travaux',
      minutes: (n) => `${n} min`,
      address: "Adresse d'intervention",
      problem: 'Problème décrit',
      noProblem: 'Aucune description.',
      artisan: 'Artisan',
      noArtisan: "Aucun artisan n'a pris cette demande.",
      review: 'Votre avis',
      noReview: "Vous n'avez pas laissé d'avis.",
      reason: "Motif d'annulation",
      byYou: 'Annulée par vous',
      byArtisan: "Annulée par l'artisan",
      client: 'Client',
      reviewReceived: 'Avis reçu',
      noReviewReceived: "Le client n'a pas laissé d'avis.",
      byClient: 'Annulée par le client',
      youCancelled: 'Annulée par vous',
      reference: 'Référence',
      close: 'Fermer',
    },
  },
  en: {
    stages: ['Searching', 'Accepted', 'On the way', 'On site', 'In progress', 'Wrapping up'],
    headline: {
      BROADCASTED: () => 'We are looking for a pro near you',
      ACCEPTED: (n) => `${n} accepted your request`,
      EN_ROUTE: (n) => `${n} is on the way`,
      ARRIVED: (n) => `${n} has arrived`,
      IN_PROGRESS: () => 'The work has started',
      DUAL_CONFIRM: () => 'Confirm that the work is done',
    },
    liveTag: 'Job in progress',
    stepOf: (n) => `Step ${n} of 6`,
    next: 'Next',
    follow: 'Track live',
    cancel: 'Cancel the request',
    cancelMessage: 'The pro will be notified and the search will stop.',
    back: 'Back',
    relaunch: 'Send again',
    call: 'Call',
    historyLabel: 'History',
    historyTitle: 'Latest jobs',
    done: 'Done',
    cancelled: 'Cancelled',
    hello: (n) => `Hello ${n}`,
    artisanFallback: 'Pro',
    details: {
      title: 'Job details',
      open: 'See details',
      date: 'Requested on',
      duration: 'Work duration',
      minutes: (n) => `${n} min`,
      address: 'Job address',
      problem: 'Problem described',
      noProblem: 'No description.',
      artisan: 'Pro',
      noArtisan: 'No pro took this request.',
      review: 'Your review',
      noReview: 'You did not leave a review.',
      reason: 'Reason for cancelling',
      byYou: 'Cancelled by you',
      byArtisan: 'Cancelled by the pro',
      client: 'Customer',
      reviewReceived: 'Review received',
      noReviewReceived: 'The customer did not leave a review.',
      byClient: 'Cancelled by the customer',
      youCancelled: 'Cancelled by you',
      reference: 'Reference',
      close: 'Close',
    },
  },
  ar: {
    stages: ['البحث', 'تم القبول', 'في الطريق', 'في المكان', 'قيد التنفيذ', 'نهاية الأشغال'],
    headline: {
      BROADCASTED: () => 'نبحث عن حرفي قريب منك',
      ACCEPTED: (n) => `${n} قبل طلبك`,
      EN_ROUTE: (n) => `${n} في الطريق إليك`,
      ARRIVED: (n) => `${n} وصل إلى المكان`,
      IN_PROGRESS: () => 'بدأت الأشغال',
      DUAL_CONFIRM: () => 'أكّد انتهاء الأشغال',
    },
    liveTag: 'تدخّل جارٍ',
    stepOf: (n) => `الخطوة ${n} من 6`,
    next: 'ثم',
    follow: 'تابع مباشرة',
    cancel: 'إلغاء الطلب',
    cancelMessage: 'سيتم إعلام الحرفي ويتوقف البحث.',
    back: 'رجوع',
    relaunch: 'إعادة الإرسال',
    call: 'اتصال',
    historyLabel: 'السجل',
    historyTitle: 'آخر التدخلات',
    done: 'مكتمل',
    cancelled: 'ملغى',
    hello: (n) => `مرحباً ${n}`,
    artisanFallback: 'حرفي',
    details: {
      title: 'تفاصيل التدخّل',
      open: 'عرض التفاصيل',
      date: 'تاريخ الطلب',
      duration: 'مدة الأشغال',
      minutes: (n) => `${n} د`,
      address: 'عنوان التدخّل',
      problem: 'المشكل الموصوف',
      noProblem: 'لا يوجد وصف.',
      artisan: 'الحرفي',
      noArtisan: 'لم يقبل أي حرفي هذا الطلب.',
      review: 'تقييمك',
      noReview: 'لم تترك تقييماً.',
      reason: 'سبب الإلغاء',
      byYou: 'ألغيته أنت',
      byArtisan: 'ألغاه الحرفي',
      client: 'الزبون',
      reviewReceived: 'التقييم المستلم',
      noReviewReceived: 'لم يترك الزبون تقييماً.',
      byClient: 'ألغاه الزبون',
      youCancelled: 'ألغيته أنت',
      reference: 'المرجع',
      close: 'إغلاق',
    },
  },
};

export function useMissionCopy(): MissionCopy {
  const language = useLanguageStore((s) => s.language);
  return missionCopy[language] ?? missionCopy.fr;
}
