import type { Language } from '../store/useLanguageStore';
import { useLanguageStore } from '../store/useLanguageStore';

interface ProviderCopy {
  hello: (name: string) => string;
  onTitle: string;
  offTitle: string;
  onText: string;
  offText: string;
  switchOn: string;
  switchOff: string;
  statDone: string;
  statRating: string;
  statOngoing: string;
  tabOngoing: string;
  tabAvailable: string;
  tabHistory: string;
  noOngoingTitle: string;
  noOngoingText: string;
  noOffersTitle: string;
  noOffersText: string;
  offlineTitle: string;
  offlineText: string;
  goOnline: string;
  noHistoryTitle: string;
  noHistoryText: string;
  client: string;
  openOffer: string;
  accept: string;
  open: string;
  done: string;
  cancelled: string;
  statusLabels: Record<string, string>;
  offerTag: string;
  offerReplyIn: string;
  offerDistance: string;
  offerAddress: string;
  offerClient: string;
  offerAccept: string;
  offerAccepting: string;
  offerDecline: string;
  offerCommission: string;
  km: string;
  fromYou: string;
  pendingTitle: string;
  pendingText: string;
  rejectedTitle: string;
  rejectedReason: string;
  rejectedText: string;
}

const providerCopy: Record<Language, ProviderCopy> = {
  fr: {
    hello: (n) => `Bonjour ${n}`,
    onTitle: 'Vous recevez des demandes',
    offTitle: 'Vous êtes hors ligne',
    onText: 'Les clients autour de vous voient que vous êtes disponible. Les nouvelles demandes arrivent en direct.',
    offText: 'Passez en ligne pour recevoir des demandes près de votre position.',
    switchOn: 'En ligne',
    switchOff: 'Hors ligne',
    statDone: 'Interventions réalisées',
    statRating: 'Note globale',
    statOngoing: 'En cours',
    tabOngoing: 'Interventions en cours',
    tabAvailable: 'Demandes entrantes',
    tabHistory: 'Historique',
    noOngoingTitle: 'Aucune intervention en cours',
    noOngoingText: 'Acceptez une demande pour la retrouver ici.',
    noOffersTitle: 'Aucune demande pour le moment',
    noOffersText: 'Vous recevrez les demandes en direct dès qu’un client à proximité lance une intervention.',
    offlineTitle: 'Vous êtes hors ligne',
    offlineText: 'Passez en ligne pour recevoir les demandes des clients proches.',
    goOnline: 'Passer en ligne',
    noHistoryTitle: 'Aucun historique pour le moment',
    noHistoryText: 'Vos interventions terminées ou annulées s’afficheront ici.',
    client: 'Client',
    openOffer: 'Demande ouverte',
    accept: 'Accepter',
    open: 'Ouvrir le suivi',
    done: 'Terminée',
    cancelled: 'Annulée',
    statusLabels: {
      ACCEPTED: 'Acceptée',
      EN_ROUTE: 'En route',
      ARRIVED: 'Sur place',
      IN_PROGRESS: 'En cours',
      DUAL_CONFIRM: 'Validation du client',
    },
    offerTag: 'Nouvelle demande',
    offerReplyIn: 'Répondez dans',
    offerDistance: 'Distance',
    offerAddress: 'Adresse',
    offerClient: 'Client',
    offerAccept: 'Accepter',
    offerAccepting: 'Acceptation…',
    offerDecline: 'Refuser',
    offerCommission: 'Commission fixe de 30 TND, prélevée automatiquement à la clôture de l’intervention.',
    km: 'km',
    fromYou: 'de votre position',
    pendingTitle: 'Votre compte est en cours de vérification',
    pendingText:
      'Notre équipe vérifie vos documents. Vous pourrez passer en ligne et recevoir des demandes dès que votre compte sera approuvé. Vous serez prévenu ici.',
    rejectedTitle: 'Votre vérification a été refusée',
    rejectedReason: 'Motif',
    rejectedText: 'Corrigez ce point et contactez El 7al pour que votre dossier soit examiné à nouveau.',
  },
  en: {
    hello: (n) => `Hello ${n}`,
    onTitle: 'You are receiving requests',
    offTitle: 'You are offline',
    onText: 'Customers around you can see you are available. New requests arrive live.',
    offText: 'Go online to receive requests near your position.',
    switchOn: 'Online',
    switchOff: 'Offline',
    statDone: 'Jobs completed',
    statRating: 'Overall rating',
    statOngoing: 'In progress',
    tabOngoing: 'Jobs in progress',
    tabAvailable: 'Incoming requests',
    tabHistory: 'History',
    noOngoingTitle: 'No job in progress',
    noOngoingText: 'Accept a request to find it here.',
    noOffersTitle: 'No request right now',
    noOffersText: 'You will get requests live as soon as a customer nearby starts a job.',
    offlineTitle: 'You are offline',
    offlineText: 'Go online to receive requests from nearby customers.',
    goOnline: 'Go online',
    noHistoryTitle: 'No history yet',
    noHistoryText: 'Your finished or cancelled jobs will appear here.',
    client: 'Customer',
    openOffer: 'Open request',
    accept: 'Accept',
    open: 'Open tracking',
    done: 'Completed',
    cancelled: 'Cancelled',
    statusLabels: {
      ACCEPTED: 'Accepted',
      EN_ROUTE: 'On the way',
      ARRIVED: 'On site',
      IN_PROGRESS: 'In progress',
      DUAL_CONFIRM: 'Customer confirming',
    },
    offerTag: 'New request',
    offerReplyIn: 'Reply within',
    offerDistance: 'Distance',
    offerAddress: 'Address',
    offerClient: 'Customer',
    offerAccept: 'Accept',
    offerAccepting: 'Accepting…',
    offerDecline: 'Decline',
    offerCommission: 'Flat commission of 30 TND, taken automatically when the job is closed.',
    km: 'km',
    fromYou: 'from your position',
    pendingTitle: 'Your account is being verified',
    pendingText:
      'Our team is checking your documents. You will be able to go online and receive requests as soon as your account is approved. You will be told here.',
    rejectedTitle: 'Your verification was refused',
    rejectedReason: 'Reason',
    rejectedText: 'Fix this point and contact El 7al so your file is reviewed again.',
  },
  ar: {
    hello: (n) => `مرحباً ${n}`,
    onTitle: 'أنت تستقبل الطلبات',
    offTitle: 'أنت غير متصل',
    onText: 'يرى العملاء القريبون منك أنك متاح. تصلك الطلبات الجديدة مباشرة.',
    offText: 'فعّل الاتصال لاستقبال الطلبات القريبة من موقعك.',
    switchOn: 'متصل',
    switchOff: 'غير متصل',
    statDone: 'التدخلات المنجزة',
    statRating: 'التقييم العام',
    statOngoing: 'قيد التنفيذ',
    tabOngoing: 'التدخلات الجارية',
    tabAvailable: 'الطلبات الواردة',
    tabHistory: 'السجل',
    noOngoingTitle: 'لا توجد تدخلات جارية',
    noOngoingText: 'اقبل طلباً لتجده هنا.',
    noOffersTitle: 'لا توجد طلبات حالياً',
    noOffersText: 'ستصلك الطلبات مباشرة عندما يطلب عميل قريب تدخلاً.',
    offlineTitle: 'أنت غير متصل',
    offlineText: 'فعّل الاتصال لاستقبال طلبات العملاء القريبين.',
    goOnline: 'تفعيل الاتصال',
    noHistoryTitle: 'لا يوجد سجل بعد',
    noHistoryText: 'ستظهر هنا تدخلاتك المنتهية أو الملغاة.',
    client: 'العميل',
    openOffer: 'طلب مفتوح',
    accept: 'قبول',
    open: 'فتح المتابعة',
    done: 'مكتملة',
    cancelled: 'ملغاة',
    statusLabels: {
      ACCEPTED: 'تم القبول',
      EN_ROUTE: 'في الطريق',
      ARRIVED: 'في المكان',
      IN_PROGRESS: 'قيد التنفيذ',
      DUAL_CONFIRM: 'تأكيد العميل',
    },
    offerTag: 'طلب جديد',
    offerReplyIn: 'أجب خلال',
    offerDistance: 'المسافة',
    offerAddress: 'العنوان',
    offerClient: 'العميل',
    offerAccept: 'قبول',
    offerAccepting: 'جارٍ القبول…',
    offerDecline: 'رفض',
    offerCommission: 'عمولة ثابتة 30 د.ت، تُخصم تلقائياً عند إغلاق التدخل.',
    km: 'كم',
    fromYou: 'من موقعك',
    pendingTitle: 'حسابك قيد التحقق',
    pendingText:
      'يراجع فريقنا وثائقك. ستتمكن من تفعيل الاتصال واستقبال الطلبات فور الموافقة على حسابك، وسيظهر لك ذلك هنا.',
    rejectedTitle: 'تم رفض التحقق',
    rejectedReason: 'السبب',
    rejectedText: 'صحّح هذه النقطة وتواصل مع El 7al لإعادة دراسة ملفك.',
  },
};

export function useProviderCopy(): ProviderCopy {
  const language = useLanguageStore((s) => s.language);
  return providerCopy[language] ?? providerCopy.fr;
}
