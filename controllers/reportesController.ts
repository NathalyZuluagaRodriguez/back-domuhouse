import { Request, Response } from "express";
import db from "../config/config-db"; // ajusta según tu estructura

export const getReporteDesempenoAgentes = async (req: Request, res: Response) => {
  try {
    const [result]: any = await db.execute(`
      SELECT 
        p.id_persona AS id_agente,
        p.nombre,
        p.apellido,
        p.correo,
        COUNT(DISTINCT prop.id_propiedad) AS total_propiedades,
        SUM(CASE WHEN prop.estado = 'Vendida' THEN 1 ELSE 0 END) AS total_vendidas,
        SUM(CASE WHEN prop.estado = 'Alquilada' THEN 1 ELSE 0 END) AS total_alquiladas,
        COUNT(DISTINCT v.id_visita) AS total_visitas,
        COUNT(DISTINCT f.id_facturacion) AS total_facturas
      FROM Persona p
      LEFT JOIN Propiedad prop ON prop.id_persona = p.id_persona
      LEFT JOIN Visita v ON v.id_persona = p.id_persona
      LEFT JOIN Facturacion f ON f.id_persona = p.id_persona
      WHERE p.id_rol = 2
      GROUP BY p.id_persona
    `);

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error al generar reporte de desempeño:", error);
    res.status(500).json({ error: "Error al generar el reporte de desempeño" });
  }
};
