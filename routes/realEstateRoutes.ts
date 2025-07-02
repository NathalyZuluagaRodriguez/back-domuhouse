import { Router } from 'express';
import realEstateController from '../controllers/realEstateController';

const router = Router();

// ==========================
// Rutas existentes (no modificar)
// ==========================

// Ruta GET para obtener todas las inmobiliarias
router.get('/getAllRealEstates', realEstateController.fetchAllRealEstates);

// Ruta GET para obtener estadísticas de inmobiliarias
router.get('/stats', realEstateController.getRealEstateStatistics);

// Ruta POST para registrar una nueva inmobiliaria
router.post('/registerRealEstate', realEstateController.registerRealEstate);

// GET /api/inmobiliarias/admin/:id
router.get("/admin/:id", realEstateController.getRealEstateByAdmin)

// ==========================
// Nuevas rutas (según solicitud anterior)
// ==========================

// Obtener una inmobiliaria por ID
router.get('/realestate/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const realEstate = await realEstateController.getRealEstateById(id);
    if (!realEstate) {
      return res.status(404).json({ message: 'Real estate not found' });
    }
    res.json(realEstate);
  } catch (error) {
    console.error('Error getting real estate by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Obtener agentes por inmobiliaria
router.get('/realestate/:id/agents', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const agents = await realEstateController.getRealEstateAgents(id);
    res.json(agents);
  } catch (error) {
    console.error('Error getting agents for real estate:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Obtener información completa de una inmobiliaria (info + agentes)
router.get('/realestate/:id/complete', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = await realEstateController.getRealEstateComplete(id);
    if (!data) {
      return res.status(404).json({ message: 'Real estate not found' });
    }
    res.json(data);
  } catch (error) {
    console.error('Error getting complete real estate info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
