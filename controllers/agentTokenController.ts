import { Request, Response } from 'express';
import AgentService from '../services/agentServices';

export const registerWithTokenController = async (req: Request, res: Response) => {
  try {
    console.log("👉 Received data:", req.body);

    const { name_person, last_name, email, phone, password, token } = req.body;

    if (!name_person || !last_name || !email || !phone || !password || !token) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const result = await AgentService.registerWithToken({
      name_person,
      last_name,
      email,
      phone,
      password,
      token
    });
    

    res.status(201).json(result);
  } catch (err: any) {
    console.error('Error in registerWithTokenController:', err);
    res.status(400).json({ error: err.message || 'Agent registration failed' });
  }
};