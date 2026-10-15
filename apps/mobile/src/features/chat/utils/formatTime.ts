const LOCALES: Record<string, string> = { fr: 'fr-FR', ar: 'ar-TN', en: 'en-GB' };

/** "14:05" for today's messages, "3 Oct, 14:05" for older ones. */
export function formatMessageTime(value: string | null | undefined, language: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  const locale = LOCALES[language] || 'fr-FR';
  try {
    const time = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    const sameDay = date.toDateString() === new Date().toDateString();
    return sameDay ? time : `${date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}, ${time}`;
  } catch {
    return '';
  }
}
