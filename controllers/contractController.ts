import { Request, Response } from 'express';
import pool from '../config/config-db';

// POST /contracts
export const createContract = async (req: Request, res: Response) => {
  try {
    // Desestructura con valores por defecto para evitar undefined
    const {
      person_id = 2, // Valor por defecto
      property_id = null,
      contract_name,
      contract_type,
      status,
      expiry_date,
      description = null,
    } = req.body;

    // Validar campos obligatorios (removido person_id)
    if (!contract_name || !contract_type || !status || !expiry_date) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Convertir IDs a número o usar valores por defecto
    const personIdNum = person_id ? Number(person_id) : 2;
    const propertyIdNum = property_id !== null ? Number(property_id) : null;

    // Insertar fila en contract
    const [result]: any = await pool.execute(
      `INSERT INTO contract 
       (person_id, property_id, contract_name, contract_type, status, expiry_date, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        personIdNum,
        propertyIdNum,
        contract_name,
        contract_type,
        status,
        expiry_date,
        description,
      ]
    );

    const contractId = result.insertId;

    // Para cada archivo subido, guardar en contract_file
    const files = (req.files as Express.Multer.File[]) || [];
    for (const f of files) {
      const url = (f as any).secure_url || f.path;
      await pool.execute(
        `INSERT INTO contract_file (contract_id, file_name, file_url)
         VALUES (?, ?, ?)`,
        [contractId, f.originalname, url]
      );
    }

    return res.status(201).json({ message: 'Contrato creado', contractId });
  } catch (err: any) {
    console.error('Error en createContract:', err);
    return res.status(500).json({ error: err.message });
  }
};

// GET /contracts
export const getAllContracts = async (_req: Request, res: Response) => {
  const [rows]: any = await pool.execute(
    `SELECT c.*, cf.file_id, cf.file_name, cf.file_url 
     FROM contract c 
     LEFT JOIN contract_file cf ON c.contract_id = cf.contract_id 
     ORDER BY c.created_at DESC`
  );
  res.json(rows);
};

// GET /contracts/:id
export const getContractById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [contractRows]: any = await pool.execute(
      `SELECT * FROM contract WHERE contract_id = ?`,
      [Number(id)]
    );

    if (!contractRows.length) {
      return res.status(404).json({ error: 'No encontrado' });
    }

    const [fileRows]: any = await pool.execute(
      `SELECT file_id, file_name, file_url FROM contract_file WHERE contract_id = ?`,
      [Number(id)]
    );

    res.json({
      ...contractRows[0],
      archivos: fileRows,
    });
  } catch (err: any) {
    console.error('Error en getContractById:', err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /contracts/:id
export const updateContract = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { contract_name, contract_type, status, expiry_date, description } = req.body;

    // Validar campos obligatorios
    if (!contract_name || !contract_type || !status || !expiry_date) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Actualizar datos
    await pool.execute(
      `UPDATE contract 
       SET contract_name=?, contract_type=?, status=?, expiry_date=?, description=?, updated_at=NOW()
       WHERE contract_id = ?`,
      [contract_name, contract_type, status, expiry_date, description, Number(id)]
    );

    // Insertar nuevos archivos
    const files = (req.files as Express.Multer.File[]) || [];
    for (const f of files) {
      const url = (f as any).secure_url || f.path;
      await pool.execute(
        `INSERT INTO contract_file (contract_id, file_name, file_url)
         VALUES (?, ?, ?)`,
        [Number(id), f.originalname, url]
      );
    }

    res.json({ message: 'Contrato actualizado' });
  } catch (err: any) {
    console.error('Error en updateContract:', err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE /contracts/:id
export const deleteContract = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.execute(`DELETE FROM contract WHERE contract_id = ?`, [Number(id)]);
    res.json({ message: 'Contrato eliminado' });
  } catch (err: any) {
    console.error('Error en deleteContract:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /contracts/:id/files/:fileId
export const downloadContractFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const [[file]]: any = await pool.execute(
      `SELECT file_name, file_url FROM contract_file WHERE file_id = ?`,
      [Number(fileId)]
    );

    if (!file) {
      return res.status(404).end();
    }

    // Si guardas en disco: return res.download(...)
    res.redirect(file.file_url);
  } catch (err: any) {
    console.error('Error en downloadContractFile:', err);
    res.status(500).end();
  }
};