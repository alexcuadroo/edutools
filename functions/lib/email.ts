import type { Env } from "./env";
import { EMAIL_FROM, PRODUCTION_SITE_URL } from "./env";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(
  message: EmailMessage,
  env: Env,
): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY no configurado, email no enviado");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error enviando email: ${response.status} - ${error}`);
  }
}

export function renderVerificationEmail(
  displayName: string | null,
  verifyUrl: string,
): EmailMessage {
  const greeting = displayName ? `Hola ${displayName}` : "Hola";
  const subject = "Verificá tu cuenta en EduTools";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #4f46e5; }
    .header h1 { margin: 0; color: #4f46e5; font-size: 28px; }
    .content { padding: 30px 0; }
    .button { display: inline-block; padding: 14px 32px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .link { word-break: break-all; color: #4f46e5; font-size: 14px; }
    .footer { padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>EduTools</h1>
  </div>
  <div class="content">
    <p>${greeting},</p>
    <p>Gracias por crear una cuenta en EduTools. Para activar tu cuenta, hacé click en el botón:</p>
    <p style="text-align: center;">
      <a href="${verifyUrl}" class="button">Verificar cuenta</a>
    </p>
    <p>Si el botón no funciona, copiá y pegá este link en tu navegador:</p>
    <p class="link">${verifyUrl}</p>
    <p>Este link expira en 24 horas.</p>
    <p>Si no creaste esta cuenta, ignorá este mensaje.</p>
  </div>
  <div class="footer">
    <p>Este email fue enviado por EduTools (${PRODUCTION_SITE_URL})</p>
  </div>
</body>
</html>
  `.trim();

  return { to: "", subject, html };
}

export function renderResetPasswordEmail(
  displayName: string | null,
  resetUrl: string,
): EmailMessage {
  const greeting = displayName ? `Hola ${displayName}` : "Hola";
  const subject = "Restablece tu contraseña de EduTools";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #4f46e5; }
    .header h1 { margin: 0; color: #4f46e5; font-size: 28px; }
    .content { padding: 30px 0; }
    .button { display: inline-block; padding: 14px 32px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .link { word-break: break-all; color: #4f46e5; font-size: 14px; }
    .footer { padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="header">
    <h1>EduTools</h1>
  </div>
  <div class="content">
    <p>${greeting},</p>
    <p>Recibimos una solicitud para restablecer tu contraseña. Hacé click en el botón:</p>
    <p style="text-align: center;">
      <a href="${resetUrl}" class="button">Restablecer contraseña</a>
    </p>
    <p>Si el botón no funciona, copiá y pegá este link en tu navegador:</p>
    <p class="link">${resetUrl}</p>
    <p>Este link expira en 1 hora.</p>
    <p>Si no solicitaste esto, ignorá este mensaje. Tu contraseña no cambiará.</p>
  </div>
  <div class="footer">
    <p>Este email fue enviado por EduTools (${PRODUCTION_SITE_URL})</p>
  </div>
</body>
</html>
  `.trim();

  return { to: "", subject, html };
}
