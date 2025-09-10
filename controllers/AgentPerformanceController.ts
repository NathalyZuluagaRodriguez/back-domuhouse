// src/controllers/getAgentPerformanceByIdController.ts
import { Request, Response } from "express";
import PropertyService from "../services/propertyServices";

const getAgentPerformanceById = async (req: Request, res: Response) => {
  let { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "Invalid agent ID" });
  }

  try {
    let result = await PropertyService.getAgentPerformanceReportById(Number(id));

    if (!result) {
      return res.status(404).json({ message: "Agent not found or no records." });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error fetching agent performance:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default getAgentPerformanceById;
