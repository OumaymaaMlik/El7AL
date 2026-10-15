import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

export async function sendEmailVerificationCode(
  toEmail: string,
  code: string,
  recipientName?: string,
  purpose: 'verify' | 'reset' | 'email-change' = 'verify',
): Promise<boolean> {
  const intro = {
    verify: 'Voici votre code pour confirmer votre adresse e-mail.',
    reset: 'Voici votre code pour réinitialiser votre mot de passe.',
    'email-change': 'Voici votre code pour confirmer votre nouvelle adresse e-mail.',
  }[purpose];
  const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'mock';
  const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
  const SMTP_USER = process.env.SMTP_USER || '';
  const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
  const FROM_EMAIL = process.env.FROM_EMAIL || `"El 7al" <${SMTP_USER}>`;

  const cleanName = (recipientName || '').trim().split(' ')[0];
  const greeting = cleanName ? `Bonjour ${cleanName},` : 'Bonjour,';

  if (EMAIL_PROVIDER === 'mock' || !SMTP_USER || !SMTP_PASS) {
    logger.info(`[DEV MAIL MOCK] To: ${toEmail} | Verification Code: [ ${code} ]`);
    return true;
  }

  const transporter =
    EMAIL_PROVIDER === 'gmail' || SMTP_HOST.includes('gmail')
      ? nodemailer.createTransport({
          service: 'gmail',
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        })
      : nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: SMTP_PORT === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

  const subject = {
    verify: `El 7al - Code de confirmation : ${code}`,
    reset: `El 7al - Réinitialisation du mot de passe : ${code}`,
    'email-change': `El 7al - Nouvelle adresse e-mail : ${code}`,
  }[purpose];

  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code de confirmation El 7al</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0E1F16;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF;">
    <tr>
      <td align="center" style="padding: 48px 20px;">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; text-align: left;">
          <!-- Header Logo: El 7al -->
          <tr>
            <td style="padding-bottom: 40px;">
              <span style="font-size: 20px; font-weight: 700; letter-spacing: -0.3px; color: #0E1F16;">
                El&nbsp;<span style="color: #0F5B3A;">7</span>al
              </span>
            </td>
          </tr>

          <!-- Greeting & Instructions -->
          <tr>
            <td style="font-size: 15px; line-height: 24px; color: #0E1F16; padding-bottom: 24px;">
              ${greeting}
              <br/><br/>
              ${intro}
            </td>
          </tr>

          <!-- Big Verification Code: 40px, weight 600, spacing 8px -->
          <tr>
            <td style="padding-bottom: 24px;">
              <div style="font-size: 40px; font-weight: 600; letter-spacing: 8px; color: #0F5B3A; line-height: 1;">
                ${code}
              </div>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td style="font-size: 14px; line-height: 22px; color: #5F6B63; padding-bottom: 36px;">
              Il expire dans 10 minutes. Ne le communiquez à personne, l'équipe El 7al ne vous le demandera jamais.
            </td>
          </tr>

          <!-- Hairline Divider -->
          <tr>
            <td style="border-top: 1px solid #E8ECE6; padding-bottom: 24px;"></td>
          </tr>

          <!-- Security Footer Notice -->
          <tr>
            <td style="font-size: 12px; line-height: 18px; color: #6B786F;">
              Vous n'avez pas fait cette demande ? Ignorez simplement cet e-mail.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textContent = `El 7al\n\n${greeting}\n\n${intro.replace(/.$/, '')} :\n\n${code}\n\nIl expire dans 10 minutes. Ne le communiquez à personne, l'équipe El 7al ne vous le demandera jamais.\n\nVous n'avez pas fait cette demande ? Ignorez simplement cet e-mail.`;

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: toEmail,
      replyTo: SMTP_USER,
      subject,
      text: textContent,
      html: htmlContent,
    });
    // The code itself is never written to production logs.
    logger.info(`Verification e-mail sent to ${toEmail} (message ${info.messageId})`);
    if (process.env.NODE_ENV !== 'production') logger.info(`Code: [ ${code} ]`);
    return true;
  } catch (error) {
    logger.error({ err: error }, `Échec de l'envoi de l'e-mail à ${toEmail}:`);
    return false;
  }
}
