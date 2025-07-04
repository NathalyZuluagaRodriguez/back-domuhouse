import nodemailer from 'nodemailer'

export const sendInvitationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f9fbfc; padding: 20px;">
      <table style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); padding: 30px;">
        <tr>
          <td style="text-align: center;">
            <h2 style="color: #267a95; margin: 0;">DomuHouse</h2>
            <p style="color: #6b7280; margin: 4px 0 20px 0;">Tu plataforma inmobiliaria de confianza</p>
            <h3 style="color: #267a95;">¡Has sido invitado a unirte como agente! 🎉</h3>
            <p style="color: #4b5563; font-size: 15px; margin-top: 10px;">
              Para completar tu registro como agente en DomuHouse, utiliza el siguiente token:
            </p>
            <div style="background: #e0f7fb; border-left: 5px solid #267a95; margin: 20px 0; padding: 15px; border-radius: 6px; color: #0c4a6e; font-weight: bold; font-size: 15px; word-break: break-all;">
              ${token}
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Este token es válido por <strong>7 días</strong>. No lo compartas con nadie.
            </p>
            
          </td>
        </tr>
        <tr>
          <td style="padding-top: 30px;">
            <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px;">
              <h4 style="margin: 0 0 10px 0; color: #111827;">¿Qué puedes hacer como agente?</h4>
              <ul style="padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.7;">
                <li>🏡 Publicar propiedades fácilmente</li>
                <li>📈 Recibir solicitudes de visitas</li>
                <li>📬 Contactar directamente con clientes</li>
                <li>🔐 Gestionar tus propiedades desde tu panel</li>
              </ul>
            </div>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; color: #9ca3af; font-size: 13px; padding-top: 30px;">
            © DomuHouse 2025. Todos los derechos reservados.
          </td>
        </tr>
      </table>
    </div>
  `

  const info = await transporter.sendMail({
    from: `"DomuHouse" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Invitación para registrarte como Agente Inmobiliario',
    html: htmlContent,
    text:  `Has sido invitado a DomuHouse como agente. Tu token es: ${token} (válido por 7 días)`
  })

  console.log('Correo de invitación enviado:', info.messageId)
}