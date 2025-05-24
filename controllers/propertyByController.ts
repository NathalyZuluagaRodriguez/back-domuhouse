import { Request, Response } from "express";
import PropertyService from "../services/propertyServices";

const getPropertiesByAgent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "ID de agente inválido" });
    }

    const propiedades = await PropertyService.getPropertiesByAgentId(Number(id));

    return res.status(200).json({ propiedades });
  } catch (error: any) {
    console.error("Error al obtener propiedades del agente:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export default getPropertiesByAgent;
