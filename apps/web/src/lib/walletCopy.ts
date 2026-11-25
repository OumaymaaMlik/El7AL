import type { Language } from '../store/useLanguageStore';
import { useLanguageStore } from '../store/useLanguageStore';
import { ACTIVATION_FEE_TND, COMMISSION_FEE_TND } from '@el7al/shared';

interface WalletCopy {
  // The notice on the artisan home
  dueTitle: string;
  dueSub: (amount: string) => string;
  dueFirstSub: (amount: string) => string;
  payButton: string;
  earnedWeek: string;
  jobsCount: (jobs: number) => string;
  toPayWeekEnd: string;
  toPayNow: string;
  payByDate: (lastDay: string) => string;
  nothingToPay: string;
  // "Payer El 7al"
  payTitle: string;
  payLead: string;
  amountLabel: string;
  ribLabel: string;
  copyRib: string;
  copied: string;
  proofTitle: string;
  proofAdd: string;
  proofChange: string;
  proofAdded: string;
  send: string;
  sending: string;
  nothingDue: string;
  back: string;
  sentToast: string;
  errNoProof: string;
  // Where the last transfer stands
  pendingTitle: string;
  pendingText: string;
  refusedTitle: string;
  refusedText: string;
  sendAgain: string;
  // The first-visit notice
  termsTitle: string;
  termsIntro: string;
  termsActivationTitle: string;
  termsActivation: string;
  termsCommissionTitle: string;
  termsCommission: string;
  termsBlockTitle: string;
  termsBlock: string;
  termsAccept: string;
  // History
  chargesTitle: string;
  transfersTitle: string;
  job: string;
  commissionWord: string;
  activationWord: string;
  receivedWord: string;
  status: { PENDING: string; APPROVED: string; REJECTED: string };
  termsFailed: string;
  // From the server
  topupApproved: { title: string; text: string };
  topupRefused: { title: string; text: string };
}

const fee = (n: number, lang: Language) => `${n} ${lang === 'ar' ? 'دينار' : 'TND'}`;

const build = (lang: Language): WalletCopy => {
  const c = fee(COMMISSION_FEE_TND, lang);
  const a = fee(ACTIVATION_FEE_TND, lang);
  const total = fee(COMMISSION_FEE_TND + ACTIVATION_FEE_TND, lang);
  if (lang === 'en') {
    return {
      dueTitle: 'Account blocked',
      dueSub: (m) => `Pay your ${m} commission to receive new requests.`,
      dueFirstSub: (m) => `Pay ${m} to receive new requests: ${c} commission + ${a} activation fee (first job).`,
      payButton: 'Pay El 7al',
      earnedWeek: 'Collected this week',
      jobsCount: (n) => `${n} job(s)`,
      toPayWeekEnd: 'To pay at the end of the week',
      toPayNow: 'To pay now',
      payByDate: (d) => `by ${d} at the latest`,
      nothingToPay: 'nothing to pay',
      payTitle: 'Pay El 7al',
      payLead: 'Transfer the amount to the bank account below, then send a photo of the receipt.',
      amountLabel: 'Amount to transfer',
      ribLabel: 'El 7al bank account (RIB)',
      copyRib: 'Copy',
      copied: 'Copied',
      proofTitle: 'Transfer receipt',
      proofAdd: 'Add a photo of the receipt',
      proofChange: 'Change',
      proofAdded: 'Photo added',
      send: 'Send the receipt',
      sending: 'Sending…',
      nothingDue: 'You owe nothing right now.',
      back: 'Back',
      sentToast: 'Receipt sent. El 7al will check it.',
      errNoProof: 'Add the photo of the receipt first.',
      pendingTitle: 'Receipt being checked',
      pendingText: 'Your account stays paused until El 7al confirms the transfer. You will be told here.',
      refusedTitle: 'Receipt refused',
      refusedText: 'El 7al could not confirm this transfer. Send a new receipt.',
      sendAgain: 'Send another receipt',
      termsTitle: 'Before you start',
      termsIntro: 'Here is how El 7al works for artisans.',
      termsActivationTitle: 'Activation fee',
      termsActivation: `${a}, once only, added to the commission of your first job.`,
      termsCommissionTitle: 'Commission',
      termsCommission: `The client pays you in cash. The first job is paid at once: ${total} (${c} + ${a}). After that, commissions (${c} per job) add up and are paid in one go at the end of the week (Sunday evening).`,
      termsBlockTitle: 'Account blocked if unpaid',
      termsBlock: 'If the amount is not paid in time, you no longer receive requests.',
      termsAccept: 'I understand',
      chargesTitle: 'Charged for your jobs',
      transfersTitle: 'Your transfers',
      job: 'Job',
      commissionWord: 'commission',
      activationWord: 'activation',
      receivedWord: 'received',
      status: { PENDING: 'Being checked', APPROVED: 'Confirmed', REJECTED: 'Refused' },
      termsFailed: 'Could not save your agreement. Check your connection and try again.',
      topupApproved: { title: 'Transfer confirmed', text: 'You can go online and receive requests.' },
      topupRefused: { title: 'Transfer refused', text: 'Your proof was refused. Send a new one.' },
    };
  }
  if (lang === 'ar') {
    return {
      dueTitle: 'الحساب محجوب',
      dueSub: (m) => `سدّد عمولتك البالغة ${m} لتستقبل طلبات جديدة.`,
      dueFirstSub: (m) => `سدّد ${m} لتستقبل طلبات جديدة: ${c} عمولة + ${a} رسوم تفعيل (أول تدخل).`,
      payButton: 'ادفع لـ El 7al',
      earnedWeek: 'ما قبضته هذا الأسبوع',
      jobsCount: (n) => `${n} تدخل`,
      toPayWeekEnd: 'للدفع في آخر الأسبوع',
      toPayNow: 'للدفع الآن',
      payByDate: (d) => `في أجل أقصاه ${d}`,
      nothingToPay: 'لا شيء للدفع',
      payTitle: 'ادفع لـ El 7al',
      payLead: 'حوّل المبلغ إلى الحساب البنكي أدناه ثم أرسل صورة الوصل.',
      amountLabel: 'المبلغ المطلوب تحويله',
      ribLabel: 'الحساب البنكي لـ El 7al (RIB)',
      copyRib: 'نسخ',
      copied: 'تم النسخ',
      proofTitle: 'وصل التحويل',
      proofAdd: 'أضف صورة الوصل',
      proofChange: 'تغيير',
      proofAdded: 'تمت إضافة الصورة',
      send: 'إرسال الوصل',
      sending: 'جارٍ الإرسال…',
      nothingDue: 'لا شيء مستحق عليك الآن.',
      back: 'رجوع',
      sentToast: 'تم إرسال الوصل. سيتحقق منه فريق El 7al.',
      errNoProof: 'أضف صورة الوصل أولًا.',
      pendingTitle: 'الوصل قيد التحقق',
      pendingText: 'يبقى حسابك موقوفًا حتى يؤكد El 7al التحويل. سيظهر لك ذلك هنا.',
      refusedTitle: 'تم رفض الوصل',
      refusedText: 'لم يتمكن El 7al من تأكيد هذا التحويل. أرسل وصلًا جديدًا.',
      sendAgain: 'إرسال وصل آخر',
      termsTitle: 'قبل أن تبدأ',
      termsIntro: 'هكذا يعمل El 7al مع الحرفيين.',
      termsActivationTitle: 'رسوم التفعيل',
      termsActivation: `${a} مرة واحدة فقط، تُضاف إلى عمولة أول تدخل لك.`,
      termsCommissionTitle: 'العمولة',
      termsCommission: `يدفع لك الزبون نقدًا. يُسدَّد أول تدخل فورًا: ${total} (${c} + ${a}). بعد ذلك تتراكم العمولات (${c} لكل تدخل) وتُسدَّد دفعة واحدة في آخر الأسبوع (مساء الأحد).`,
      termsBlockTitle: 'يُحجب حسابك عند عدم الدفع',
      termsBlock: 'إذا لم يُسدَّد المبلغ في أجله، لن تصلك طلبات.',
      termsAccept: 'فهمت',
      chargesTitle: 'ما احتُسب على تدخلاتك',
      transfersTitle: 'تحويلاتك',
      job: 'تدخل',
      commissionWord: 'العمولة',
      activationWord: 'التفعيل',
      receivedWord: 'المبلغ المستلم',
      status: { PENDING: 'قيد التحقق', APPROVED: 'مؤكد', REJECTED: 'مرفوض' },
      termsFailed: 'تعذّر حفظ موافقتك. تحقق من الاتصال وأعد المحاولة.',
      topupApproved: { title: 'تم تأكيد التحويل', text: 'يمكنك الآن الاتصال واستقبال الطلبات.' },
      topupRefused: { title: 'تم رفض التحويل', text: 'تم رفض الإثبات. أرسل إثباتًا جديدًا.' },
    };
  }
  return {
    dueTitle: 'Compte bloqué',
    dueSub: (m) => `Réglez votre commission de ${m} pour recevoir de nouvelles demandes.`,
    dueFirstSub: (m) =>
      `Réglez ${m} pour recevoir de nouvelles demandes : ${c} de commission + ${a} de frais d'activation (première intervention).`,
    payButton: 'Payer El 7al',
    earnedWeek: 'Encaissé cette semaine',
    jobsCount: (n) => `${n} intervention(s)`,
    toPayWeekEnd: 'À payer en fin de semaine',
    toPayNow: 'À payer maintenant',
    payByDate: (d) => `au plus tard ${d}`,
    nothingToPay: 'rien à payer',
    payTitle: 'Payer El 7al',
    payLead: 'Virez le montant sur le compte bancaire ci-dessous, puis envoyez la photo du reçu.',
    amountLabel: 'Montant à virer',
    ribLabel: 'Compte bancaire El 7al (RIB)',
    copyRib: 'Copier',
    copied: 'Copié',
    proofTitle: 'Reçu du virement',
    proofAdd: 'Ajouter la photo du reçu',
    proofChange: 'Changer',
    proofAdded: 'Photo ajoutée',
    send: 'Envoyer la preuve',
    sending: 'Envoi…',
    nothingDue: "Vous ne devez rien pour l'instant.",
    back: 'Retour',
    sentToast: 'Reçu envoyé. El 7al va le vérifier.',
    errNoProof: "Ajoutez d'abord la photo du reçu.",
    pendingTitle: 'Reçu en cours de vérification',
    pendingText: 'Votre compte reste en pause jusqu’à la confirmation du virement par El 7al. Vous serez prévenu ici.',
    refusedTitle: 'Reçu refusé',
    refusedText: "El 7al n'a pas pu confirmer ce virement. Envoyez un nouveau reçu.",
    sendAgain: 'Envoyer un autre reçu',
    termsTitle: 'Avant de commencer',
    termsIntro: 'Voici comment El 7al fonctionne pour les artisans.',
    termsActivationTitle: "Frais d'activation",
    termsActivation: `${a} d'activation, une seule fois, ajoutés à la commission de votre première intervention.`,
    termsCommissionTitle: 'Commission',
    termsCommission: `Le client vous paie en espèces. La première intervention se règle tout de suite : ${total} (${c} + ${a}). Ensuite, les commissions (${c} par intervention) s'additionnent et se règlent en une fois à la fin de la semaine (dimanche soir).`,
    termsBlockTitle: 'Compte bloqué si impayé',
    termsBlock: "Si le montant n'est pas réglé à temps, vous ne recevez plus de demandes.",
    termsAccept: "J'ai compris",
    chargesTitle: 'Facturé pour vos interventions',
    transfersTitle: 'Vos virements',
    job: 'Intervention',
    commissionWord: 'commission',
    activationWord: 'activation',
    receivedWord: 'reçu',
    status: { PENDING: 'En vérification', APPROVED: 'Validé', REJECTED: 'Refusé' },
    termsFailed: "Impossible d'enregistrer votre accord. Vérifiez la connexion et réessayez.",
    topupApproved: { title: 'Virement confirmé', text: 'Vous pouvez passer en ligne et recevoir des demandes.' },
    topupRefused: { title: 'Virement refusé', text: 'Votre preuve a été refusée. Envoyez-en une nouvelle.' },
  };
};

export function useWalletCopy(): WalletCopy {
  const language = useLanguageStore((s) => s.language);
  return build(language);
}
