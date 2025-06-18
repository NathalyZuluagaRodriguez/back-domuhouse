import { Request, Response } from 'express';
import generateToken from '../Helpers/generateToken';
import  { transporter, MAIL_FROM } from '../config/config-mailers';
import userService from '../services/UserServices';
import generateHash from '../Helpers/generateHash';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const registerIndependentUser = async (req: Request, res: Response) => {
  try {
    const user = req.body;
    user.password = await generateHash(user.password);
    const createdUser = await userService.register(user);

    const token = generateToken({ email: user.email }, 10);

    return res.status(201).json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error registering user' });
  }
};

export const sendConfirmationEmail = async (req: Request, res: Response) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ error: 'Email and token are required' });
  }

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: email,
      subject: 'Registration Confirmation - DomuHouse',
      html: `<p>Click the following link to confirm your registration:</p>
             <a href="http://localhost:10101/independent/confirm-registration?token=${token}">Confirm Registration</a>`
    });

    return res.json({ message: 'Confirmation email sent' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error sending confirmation email' });
  }
};

export const confirmIndependentRegistration = async (req: Request, res: Response) => {
  const token = req.body.token || req.query.token;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.KEY_TOKEN as string) as any;
    const email = decoded.data.email;

    return res.json({ message: 'Token is valid', email });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
