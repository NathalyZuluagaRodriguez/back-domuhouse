import { Request, Response } from "express";
import usuarioServi from "../services/UserServices";
import Agent from "../Dto/AgentsDto";

const registerAgent = async (req: Request, res: Response) => {
    console.log("BODY recibido:", req.body);

    try {
        const { name, lastname, email, phone, password, id_real_estate, id_role } = req.body;

        if ([name, lastname, email, phone, password, id_real_estate, id_role].some(field => field === undefined || field === null || field === "")) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }


        const agente = new Agent(name, lastname, email, phone, password, id_real_estate, id_role);
        const result = await usuarioServi.registerAgent(agente);

        return res.status(201).json({
            message: "Agente registrado con éxito",
            agente: {
                name,
                lastname,
                email,
                phone,
                id_real_estate,
                id_role
            }
        });
    } catch (error: any) {
        console.error("Error registrando agente:", error);
        return res.status(500).json({ error: error.message || "Error al registrar agente" });
    }
};

export default registerAgent;