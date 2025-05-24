import { Router } from 'express';
import { AgendaRepository } from '../repositories/AgendaRepository';

const router = Router();
const repo = new AgendaRepository();

// POST /agenda
router.post('/', async (req, res) => {
  const { fecha_visita, id_propiedad, id_persona } = req.body;
  if (!fecha_visita || !id_propiedad || !id_persona) {
    return res.status(400).json({ message: 'Faltan datos' });
  }
  try {
    await repo.crearVisita(fecha_visita, id_propiedad, id_persona);
    res.status(201).json({ message: 'Visita agendada exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al agendar visita', error: err });
  }
});

// GET /agenda/:usuarioId
router.get('/:usuarioId', async (req, res) => {
  try {
    const visitas = await repo.obtenerVisitasPorUsuario(Number(req.params.usuarioId));
    res.json(visitas);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener agenda' });
  }
});

// POST /agenda/:id/confirmar
router.post('/:id/confirmar', async (req, res) => {
  try {
    await repo.confirmarVisita(Number(req.params.id));
    res.json({ message: 'Visita confirmada' });
  } catch (err) {
    res.status(500).json({ message: 'Error al confirmar visita' });
  }
});

// PUT /agenda/:id
router.put('/:id', async (req, res) => {
  const { fecha_visita } = req.body;
  if (!fecha_visita) return res.status(400).json({ message: 'Fecha requerida' });

  try {
    await repo.actualizarVisita(Number(req.params.id), fecha_visita);
    res.json({ message: 'Visita actualizada' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar' });
  }
});

// GET /agenda/disponibilidad?fecha=2025-04-30
router.get('/disponibilidad', async (req, res) => {
  const { fecha } = req.query;
  if (!fecha) return res.status(400).json({ message: 'Fecha requerida' });

  try {
    const disponibles = await repo.obtenerDisponibilidad(fecha.toString());
    res.json(disponibles);
  } catch (err) {
    res.status(500).json({ message: 'Error al consultar disponibilidad' });
  }
});

// GET /agenda/personas
router.get('/personas/listar', async (_req, res) => {
  try {
    const personas = await repo.listarPersonas();
    res.json(personas);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar personas' });
  }
});

// GET /agenda/propiedades
router.get('/propiedades/listar', async (_req, res) => {
  try {
    const propiedades = await repo.listarPropiedades();
    res.json(propiedades);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar propiedades' });
  }
});

export default router;
