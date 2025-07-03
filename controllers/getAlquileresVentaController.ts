import { Request, Response } from "express";
import PropertyService from "../services/propertyServices";

const getAgentSalesAndRentals = async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agentId ? parseInt(req.query.agentId as string, 10) : undefined;

    const properties = await PropertyService.getAgentSalesAndRentals(agentId);
    return res.status(200).json({ salesAndRentals: properties });
  } catch (error: any) {
    console.error("Error fetching sales and rentals:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default getAgentSalesAndRentals;
