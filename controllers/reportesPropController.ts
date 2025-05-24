import { Request, Response } from 'express';
import db from '../config/config-db';

export const getReportePropiedades = async (req: Request, res: Response) => {
  try {
    const [rows]: any[] = await db.execute(`
      SELECT 
        p.id_propiedad,
        p.direccion,
        p.precio,
        p.estado,
        tp.nombre_tipo_propiedad AS tipo,
        CONCAT(pe.nombre, ' ', pe.apellido) AS agente
      FROM Propiedad p
      LEFT JOIN Tipo_Propiedad tp ON p.id_tipo_propiedad = tp.id_tipo_propiedad
      LEFT JOIN Persona pe ON p.id_persona = pe.id_persona
    `);

    const disponibles: any[] = [];
    const alquiladas: any[] = [];
    const vendidas: any[] = [];

    rows.forEach((propiedad: any) => {
      const item = {
        id_propiedad: propiedad.id_propiedad,
        direccion: propiedad.direccion,
        precio: propiedad.precio,
        tipo: propiedad.tipo,
        agente: propiedad.agente
      };

      switch (propiedad.estado) {
        case 'Disponible':
          disponibles.push(item);
          break;
        case 'Alquilada':
          alquiladas.push(item);
          break;
        case 'Vendida':
          vendidas.push(item);
          break;
      }
    });

    const resumen = {
      total_disponibles: disponibles.length,
      total_alquiladas: alquiladas.length,
      total_vendidas: vendidas.length
    };

    return res.json({
      resumen,
      disponibles,
      alquiladas,
      vendidas
    });
  } catch (error) {
    console.error('Error generando el reporte:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de propiedades',
    });
  }
};
