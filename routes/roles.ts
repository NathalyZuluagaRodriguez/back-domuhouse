import { Router } from 'express';
import { RoleRepository } from '../repositories/roleRepository';

const router = Router();
const roleRepo = new RoleRepository();

// GET /roles
router.get('/', async (req, res) => {
  try {
    const roles = await roleRepo.getAllRoles();
    res.status(200).json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ message: 'Error al obtener roles' });
  }
});

// POST /roles
router.post('/', async (req, res) => {
  try {
    const { nombre_rol } = req.body;
    
    // Validación básica
    if (!nombre_rol) {
      return res.status(400).json({ message: 'El nombre del rol es requerido' });
    }
    
    const result = await roleRepo.createRole(nombre_rol);
    
    res.status(201).json({
      message: 'Rol creado exitosamente',
      id: result.insertId,
      nombre_rol
    });
  } catch (error) {
    console.error('Error al crear rol:', error);
    res.status(500).json({ message: 'Error al crear el rol' });
  }


  
});

// PUT /roles/:id
router.put('/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { nombre_rol } = req.body;
      
      // Validaciones
      if (isNaN(id)) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      
      if (!nombre_rol) {
        return res.status(400).json({ message: 'El nombre del rol es requerido' });
      }
      
      // Verificar si el rol existe
      const existingRole = await roleRepo.getRoleById(id);
      if (!existingRole) {
        return res.status(404).json({ message: `No se encontró el rol con ID ${id}` });
      }
      
      // Actualizar rol
      const result = await roleRepo.updateRole(id, nombre_rol);
      
      // Verificar si se actualizó algún registro
      if ((result as any).affectedRows === 0) {
        return res.status(404).json({ message: 'No se pudo actualizar el rol' });
      }
      
      res.status(200).json({
        message: 'Rol actualizado exitosamente',
        id,
        nombre_rol
      });
    } catch (error: any) {
      console.error('Error al actualizar rol:', error.message, error.stack);
      res.status(500).json({ message: 'Error al actualizar el rol' });
    }
    
  });

  // DELETE /roles/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Validación
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    // Verificar si el rol existe
    const existingRole = await roleRepo.getRoleById(id);
    if (!existingRole) {
      return res.status(404).json({ message: `No se encontró el rol con ID ${id}` });
    }

    // Eliminar el rol
    const result = await roleRepo.deleteRoleById(id);

    res.status(200).json({ message: 'Rol eliminado exitosamente', id });
  } catch (error: any) {
    console.error('Error al eliminar rol:', error.message, error.stack);
    res.status(500).json({ message: 'Error al eliminar el rol' });
  }
});


export default router;