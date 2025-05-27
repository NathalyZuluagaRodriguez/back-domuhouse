import { Request, Response } from "express";
import usuarioServi from "../services/UserServices";
import Agent from "../Dto/AgentsDto";

const registerAgent = async (req: Request, res: Response) => {
  try {
    const { nombre, apellido, email, telefono, password, id_inmobiliaria, id_rol } = req.body;

    if (!nombre || !apellido || !email || !telefono  || !password || !id_inmobiliaria || !id_rol) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const agente = new Agent(nombre, apellido, email, telefono, password, id_inmobiliaria, id_rol);
    const result = await usuarioServi.registerAgent(agente);

    return res.status(201).json({ 
      message: "Agente registrado con éxito", 
      agente: {
        nombre,
        apellido,
        email,
        telefono,
        id_inmobiliaria,
        id_rol
      }
    });
  } catch (error: any) {
    console.error("Error registrando agente:", error);
    return res.status(500).json({ error: error.message || "Error al registrar agente" });
  }
};

export default registerAgent;