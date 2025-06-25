import { Request, Response } from "express";
import AgentService from "../services/agentServices";

const registerAgentWithToken = async (req: Request, res: Response) => {
  try {
    const { name_person, last_name, email, phone, password, token } = req.body;

    if (!name_person || !last_name || !email || !phone || !password || !token) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const result = await AgentService.registerWithToken({
      name_person,
      last_name,
      email,
      phone,
      password,
      token,
    });

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Error al registrar agente" });
  }
};

export default registerAgentWithToken;
