import { Request, Response } from "express";
import ClientService from "../services/clientServices";

export const getAllClients = async (_req: Request, res: Response) => {
  try {
    const clients = await ClientService.getAllClients();
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error getAllClients:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
};