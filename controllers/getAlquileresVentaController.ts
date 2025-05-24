// src/controllers/getVentasAlquileresController.ts
import { Request, Response } from "express";
import { getVentasAlquileresAgente } from "../services/propertyServices";

const getVentasAlquileres = async (req: Request, res: Response) => {
  try {
    const id_agente = req.query.id_agente ? parseInt(req.query.id_agente as string, 10) : undefined;

    const propiedades = await getVentasAlquileresAgente(id_agente);
    return res.status(200).json(propiedades);
  } catch (error: any) {
    console.error("Error obteniendo ventas y alquileres:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default getVentasAlquileres;
