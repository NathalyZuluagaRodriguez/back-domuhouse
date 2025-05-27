import nodemailer from 'nodemailer';

export const sendInvitationEmail = async (to: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const info = await transporter.sendMail({
    from: `"DomuHouse" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Invitación para registrarte como Agente Inmobiliario',
    html: `
      <h3>¡Hola!</h3>
      <p>Has sido invitado a registrarte como agente en DomuHouse.</p>
      <p>Este es tu token de invitación (válido por 7 días):</p>
      <pre style="background:#f4f4f4;padding:10px;border-radius:5px">${token}</pre>
    `
  });

  console.log('Correo de invitación enviado:', info.messageId);
};

const sendEmailer = async (to: string, subject: string, text: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    });
};

export default sendEmailer;
