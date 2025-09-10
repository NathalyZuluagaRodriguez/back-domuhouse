import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* -------------------------------
   1. Estilizado: Invitación Agente
---------------------------------*/
export async function sendInvitationEmail(to: string, token: string) {
const html = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fbfc;padding:20px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border-radius:10px;padding:30px;font-family:Arial,sans-serif;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
        <tr>
          <td align="center" style="color:#267a95;font-size:24px;font-weight:bold;">
            DomuHouse
          </td>
        </tr>
        <tr>
          <td align="center" style="color:#6b7280;font-size:14px;padding-bottom:20px;">
            Tu plataforma inmobiliaria de confianza
          </td>
        </tr>
        <tr>
          <td align="center" style="color:#267a95;font-size:20px;font-weight:bold;">
            ¡Has sido invitado como agente! 🎉
          </td>
        </tr>
        <tr>
          <td align="center" style="color:#374151;font-size:16px;padding:10px 0;">
            Utiliza este token para completar tu registro:
          </td>
        </tr>
        <tr>
          <td align="center" style="background:#e0f7fb;border-left:5px solid #267a95;padding:15px;margin:20px 0;border-radius:6px;color:#0c4a6e;font-weight:bold;font-size:16px;">
            ${token}
          </td>
        </tr>
        <tr>
          <td align="center" style="color:#6b7280;font-size:14px;padding:10px 0;">
            Este token es válido por <strong>7 días</strong>. No lo compartas con nadie.
          </td>
        </tr>
        <tr>
          <td style="padding:20px 0;">
            <table width="100%" style="background-color:#f1f5f9;border-radius:8px;padding:20px;">
              <tr>
                <td style="color:#111827;font-size:16px;padding-bottom:10px;font-weight:bold;">¿Qué puedes hacer como agente?</td>
              </tr>
              <tr>
                <td style="color:#374151;font-size:14px;line-height:1.6;">
                  <ul style="padding-left:20px;margin:0;">
                    <li>🏡 Publicar propiedades fácilmente</li>
                    <li>📈 Recibir solicitudes de visitas</li>
                    <li>📬 Contactar directamente con clientes</li>
                    <li>🔐 Gestionar tus propiedades desde tu panel</li>
                  </ul>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="color:#9ca3af;font-size:13px;padding-top:30px;">
            © DomuHouse 2025. Todos los derechos reservados.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;


console.log("🟢 Plantilla AZUL en uso — LEN:", html.length);

await transporter.sendMail({
  from: `"DomuHouse" <${process.env.EMAIL_USER}>`,
  to,
  subject: "Invitación para registrarte como Agente Inmobiliario",
  html, // solo esto, sin `text`
});


}

/* -----------------------------------------------
   2. Estilizado: Confirmación Registro Inmobiliaria
------------------------------------------------- */
export async function sendRealEstateConfirmationEmail(to: string, realEstateName: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f9fbfc; padding: 20px;">
      <table style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); padding: 30px;">
        <tr>
          <td style="text-align: center;">
            <h2 style="color: #267a95;">DomuHouse</h2>
            <p style="color: #6b7280;">Tu plataforma inmobiliaria de confianza</p>

            <h3 style="color: #267a95;">¡Registro exitoso! 🏠</h3>
            <p style="color: #374151; font-size: 15px;">
              Tu inmobiliaria <strong>${realEstateName}</strong> ha sido registrada correctamente.
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              Ya puedes iniciar sesión como administrador para gestionar propiedades, agentes y más.
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; color: #9ca3af; font-size: 13px; padding-top: 30px;">
            © DomuHouse 2025. Todos los derechos reservados.
          </td>
        </tr>
      </table>
    </div>
  `;

  await transporter.sendMail({
    from: `"DomuHouse" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Registro exitoso de inmobiliaria",
    html
    });
}
