import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Opción 1: si tienes un MAIL_FROM definido en .env
const MAIL_FROM = process.env.EMAIL_USER;

export default transporter;
export { MAIL_FROM };
