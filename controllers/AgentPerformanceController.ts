// src/controllers/getAgentPerformanceByIdController.ts
import { Request, Response } from "express";
import { getAgentePerformanceReportById } from "../services/propertyServices";

const getAgentePerformanceById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const resultados = await getAgentePerformanceReportById(Number(id));

    if (resultados.length === 0) {
      return res.status(404).json({ message: "Agente no encontrado o sin registros." });
    }

    return res.status(200).json(resultados[0]);
  } catch (error: any) {
    console.error("Error al obtener desempeño del agente:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default getAgentePerformanceById;
