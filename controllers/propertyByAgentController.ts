import { Request, Response } from "express";
import PropertyService from "../services/propertyServices";

/*-----------------------------------------------------------
  1. List agent’s properties
-----------------------------------------------------------*/
export async function listPropertiesByAgent(req: Request, res: Response) {
  try {
    let { agentId } = req.params;

    if (!agentId || isNaN(Number(agentId))) {
      return res.status(400).json({ error: "Invalid agent ID" });
    }

    let properties = await PropertyService.getPropertiesByAgentId(Number(agentId));
    return res.json({ properties });
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/*-----------------------------------------------------------
  2. Sold / rented list
-----------------------------------------------------------*/
export async function listSalesAndRentals(req: Request, res: Response) {
  try {
    let agentId = req.params.agentId ? Number(req.params.agentId) : undefined;

    let salesAndRentals = await PropertyService.getAgentSalesAndRentals(agentId);
    return res.json({ salesAndRentals });
  } catch (error: any) {
    console.error("Error fetching sales/rentals:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/*-----------------------------------------------------------
  3. Performance report
-----------------------------------------------------------*/
export async function getAgentPerformanceReport(req: Request, res: Response) {
  try {
    let { agentId } = req.params;

    if (!agentId || isNaN(Number(agentId))) {
      return res.status(400).json({ error: "Invalid agent ID" });
    }

    let report = await PropertyService.getAgentPerformanceReportById(Number(agentId));
    return res.json({ report });
  } catch (error: any) {
    console.error("Error generating performance report:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}


/* Ver detalle de propiedad */
export async function getProperty(req: Request, res: Response) {
  const { agentId, propertyId } = req.params;
  const property = await PropertyService.getPropertyById(
    Number(propertyId),
    Number(agentId)
  );
  if (!property) return res.status(404).json({ error: "Not found" });
  res.json({ property });
}

/* Actualizar propiedad */
export async function updateProperty(req: Request, res: Response) {
  const { agentId, propertyId } = req.params;
  const affected = await PropertyService.updatePropertyById(
    Number(propertyId),
    Number(agentId),
    req.body
  );
  if (!affected) return res.status(404).json({ error: "Not found" });
  res.json({ message: "Updated" });
}

/* Eliminar propiedad */
export async function deleteProperty(req: Request, res: Response) {
  const { agentId, propertyId } = req.params;
  const affected = await PropertyService.deletePropertyById(
    Number(propertyId),
    Number(agentId)
  );
  if (!affected) return res.status(404).json({ error: "Not found" });
  res.json({ message: "Deleted" });
}



/*-----------------------------------------------------------
  Optional default export if you prefer to import everything at once
-----------------------------------------------------------*/
export default {
  listPropertiesByAgent,
  listSalesAndRentals,
  getAgentPerformanceReport,
  getProperty,
  updateProperty,
  deleteProperty
};
