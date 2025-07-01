import { Request, Response } from "express";
import VisitService from "../services/visitServices";
import ClientService from "../services/clientServices";

/* GET /api/agents/:agentId/visits */
export async function listVisitsByAgent(req: Request, res: Response) {
    try {
        const agentId = Number(req.params.agentId);
        if (isNaN(agentId)) {
            return res.status(400).json({ error: "Invalid agent ID" });
        }

        const visits = await VisitService.getVisitsByAgentId(agentId);
        return res.json({ visits });
    } catch (err: any) {
        console.error("Error fetching visits:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
/* POST /api/agents/:agentId/visits */
export async function scheduleVisit(req: Request, res: Response) {
  try {
    const agentId = Number(req.params.agentId);
    const { propertyId, visitDate, status = "Pendiente", visitType, notes, client } = req.body;

    if (!agentId || !propertyId || !visitDate || !client || !client.email) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Buscar cliente existente
    const clientId = await ClientService.findByEmail(client.email);
    if (!clientId) {
      return res.status(404).json({ error: "Cliente no registrado" });
    }

    // Crear la visita
    const newVisit = await VisitService.createVisit(
      agentId,
      Number(propertyId),
      Number(clientId),
      visitDate,
      status,
      visitType,
      notes
    );

    return res.status(201).json({ visit: newVisit });
  } catch (err: any) {
    console.error("Error scheduling visit:", err);
    if (err.message === "La propiedad no pertenece a este agente") {
      return res.status(403).json({ error: err.message });
    }
    return res.status(500).json({ error: "Error interno al agendar visita" });
  }
}

/* PATCH /api/visits/:id/status  (confirmar/cancelar) */
export const changeVisitStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body     // "Confirmada", "Pendiente", "Cancelada"
    const visit = await VisitService.updateStatus(Number(id), status)
    res.json(visit)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

/* PUT /api/visits/:id  (editar visita) */
export const updateVisit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const visit = await VisitService.updateVisit(Number(id), req.body)
    res.json(visit)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

/* DELETE /api/visits/:id */
export const deleteVisit = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const result = await VisitService.deleteVisit(Number(id))
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

