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

export const getGlobalSalesReport = async (req: Request, res: Response) => {
  try {
    // Parámetro opcional para filtrar por agente
    const agentId = req.query.agentId ? parseInt(req.query.agentId as string, 10) : undefined;

    // 1. Lista detallada (ya la tienes)
    const sales = await PropertyService.getAgentSalesAndRentals(agentId);

    // 2. Resumen global
    const summary = await PropertyService.getGlobalSalesSummary(agentId);

    return res.status(200).json({ sales, summary });
  } catch (error: any) {
    console.error("Error fetching global sales report:", error);
    return res.status(500).json({ error: error.message });
  }
}

export const getSoldPropertiesCount = async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agentId ? parseInt(req.query.agentId as string, 10) : undefined;

    const result = await PropertyService.getTotalSoldProperties(agentId);
    return res.status(200).json({ totalSold: result.totalSold });
  } catch (error: any) {
    console.error("Error fetching sold properties count:", error);
    return res.status(500).json({ error: error.message });
  }
}

export const getSalesByPropertyType = async (req: Request, res: Response) => {
  try {
    const agentId = req.query.agentId ? parseInt(req.query.agentId as string, 10) : undefined;

    const tiposPropiedades = await PropertyService.getSalesByPropertyType(agentId);
    return res.status(200).json({ tiposPropiedades });
  } catch (error: any) {
    console.error("Error fetching property‑type sales:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getTopAgents = async (req: Request, res: Response) => {
  try {
    const topAgentes = await PropertyService.getTopAgents();
    return res.status(200).json({ topAgentes });
  } catch (error: any) {
    console.error("Error fetching top agents:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default getAgentSalesAndRentals;
