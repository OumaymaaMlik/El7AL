import type { Language } from '../store/useLanguageStore';
import { useLanguageStore } from '../store/useLanguageStore';

interface ReportCopy {
  button: string;
  title: string;
  lead: string;
  placeholder: string;
  send: string;
  sentTitle: string;
  sentText: string;
  failed: string;
}

const copy: Record<Language, ReportCopy> = {
  fr: {
    button: 'Signaler un problème',
    title: 'Signaler un problème',
    lead: "Expliquez ce qui s'est passé. L'équipe El 7al reçoit votre signalement.",
    placeholder: "Ex. : le montant demandé n'est pas celui annoncé.",
    send: 'Envoyer le signalement',
    sentTitle: 'Signalement envoyé',
    sentText: "L'équipe El 7al va l'examiner.",
    failed: "Impossible d'envoyer le signalement.",
  },
  en: {
    button: 'Report a problem',
    title: 'Report a problem',
    lead: 'Tell us what happened. The El 7al team receives your report.',
    placeholder: 'E.g. the price asked is not the one announced.',
    send: 'Send the report',
    sentTitle: 'Report sent',
    sentText: 'The El 7al team will look into it.',
    failed: 'Could not send the report.',
  },
  ar: {
    button: 'الإبلاغ عن مشكلة',
    title: 'الإبلاغ عن مشكلة',
    lead: 'اشرح ما حدث. يستلم فريق El 7al بلاغك.',
    placeholder: 'مثال: المبلغ المطلوب ليس المبلغ المعلن.',
    send: 'إرسال البلاغ',
    sentTitle: 'تم إرسال البلاغ',
    sentText: 'سيفحصه فريق El 7al.',
    failed: 'تعذّر إرسال البلاغ.',
  },
};

export function useReportCopy(): ReportCopy {
  const language = useLanguageStore((s) => s.language);
  return copy[language] ?? copy.fr;
}
