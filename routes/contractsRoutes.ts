import express from 'express';
import multer from '../middleware/upload';      // tu configuración de multer
import {
  createContract,
  getAllContracts,
  getContractById,
  updateContract,
  deleteContract,
  downloadContractFile
} from '../controllers/contractController';


const router = express.Router();

// 1. Listar todos los contratos
router.get('/', getAllContracts);

// 2. Obtener un contrato y sus archivos
router.get('/:id', getContractById);

// 3. Crear contrato + subir archivos
router.post(
  '/',
  multer.array('files'),       // <input name="files" multiple />
  createContract
);

// 4. Editar contrato (datos y opcionalmente nuevos archivos)
router.put(
  '/:id',
  multer.array('files'),
  updateContract
);

// 5. Eliminar contrato (y en cascade sus archivos)
router.delete('/:id', deleteContract);

// 6. Descargar un archivo concreto
router.get('/:id/files/:fileId', downloadContractFile);



export default router;
