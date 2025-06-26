// routes/searchProperty.ts
import { Router } from 'express';
import { PropertyRepository, SearchFilters } from '../repositories/propertyRepository';

const router = Router();

// 🔍 RUTA PRINCIPAL DE BÚSQUEDA - MANTENER INTACTA
router.get('/search', async (req, res) => {
  try {
    console.log('🔍 Parámetros de búsqueda recibidos:', req.query);
    
    // Extraer filtros de los query parameters
    const filters: SearchFilters = {};
    
    // Filtro de tipo de operación (Venta/Arriendo)
    if (req.query.operation_type) {
      filters.operation_type = req.query.operation_type as string;
    }
    
    // Filtro de tipo de propiedad
    if (req.query.property_type) {
      filters.property_type_id = parseInt(req.query.property_type as string);
    }
    
    // Filtros de ubicación
    if (req.query.city) {
      filters.city = req.query.city as string;
    }
    
    if (req.query.neighborhood) {
      filters.neighborhood = req.query.neighborhood as string;
    }
    
    // Filtros de precio
    if (req.query.price_min) {
      filters.price_min = parseInt(req.query.price_min as string);
    }
    
    if (req.query.price_max) {
      filters.price_max = parseInt(req.query.price_max as string);
    }
    
    // Filtros avanzados
    if (req.query.bedrooms_min) {
      filters.bedrooms_min = parseInt(req.query.bedrooms_min as string);
    }
    
    if (req.query.bathrooms_min) {
      filters.bathrooms_min = parseInt(req.query.bathrooms_min as string);
    }
    
    if (req.query.parking_spaces) {
      filters.parking_spaces_min = parseInt(req.query.parking_spaces as string);
    }
    
    if (req.query.socioeconomic_stratum) {
      filters.socioeconomic_stratum = parseInt(req.query.socioeconomic_stratum as string);
    }
    
    // Ordenamiento
    if (req.query.order) {
      filters.order = req.query.order as string;
    }
    
    console.log('🔧 Filtros procesados:', filters);
    
    // Ejecutar búsqueda
    const properties = await PropertyRepository.searchAdvanced(filters);
    
    console.log(`📊 Propiedades encontradas: ${properties.length}`);
    
    // Responder con las propiedades encontradas
    res.json(properties);
    
  } catch (error) {
    console.error('❌ Error en búsqueda de propiedades:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// 🏠 NUEVA RUTA OPTIMIZADA PARA FILTRAR POR OPERACIÓN
router.get('/filter/:operation', async (req, res) => {
  try {
    const operation = req.params.operation; // "Venta" o "Arriendo"
    
    // Validar que el tipo de operación sea válido
    if (!['Venta', 'Arriendo'].includes(operation)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de operación inválido. Use "Venta" o "Arriendo"'
      });
    }
    
    console.log(`🏠 Filtrando propiedades por operación: ${operation}`);
    
    const filters: SearchFilters = {
      operation_type: operation
    };
    
    const properties = await PropertyRepository.searchAdvanced(filters);
    
    console.log(`📊 Propiedades de ${operation} encontradas: ${properties.length}`);
    
    res.json({
      success: true,
      operation_type: operation,
      count: properties.length,
      properties: properties
    });
    
  } catch (error) {
    console.error('❌ Error al filtrar por operación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al filtrar propiedades por operación',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// 📊 RUTA PARA OBTENER TODAS LAS PROPIEDADES CON SEPARACIÓN POR OPERACIÓN
router.get('/all-by-operation', async (req, res) => {
  try {
    console.log('📊 Obteniendo todas las propiedades separadas por operación');
    
    // Obtener propiedades en venta
    const ventaFilters: SearchFilters = { operation_type: 'Venta' };
    const ventaProperties = await PropertyRepository.searchAdvanced(ventaFilters);
    
    // Obtener propiedades en arriendo
    const arriendoFilters: SearchFilters = { operation_type: 'Arriendo' };
    const arriendoProperties = await PropertyRepository.searchAdvanced(arriendoFilters);
    
    console.log(`📈 Estadísticas: Venta(${ventaProperties.length}) - Arriendo(${arriendoProperties.length})`);
    
    res.json({
      success: true,
      statistics: {
        venta: {
          count: ventaProperties.length,
          properties: ventaProperties
        },
        arriendo: {
          count: arriendoProperties.length,
          properties: arriendoProperties
        },
        total: ventaProperties.length + arriendoProperties.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener propiedades por operación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener propiedades separadas por operación'
    });
  }
});

// 🔍 RUTA ESPECÍFICA PARA BÚSQUEDA RÁPIDA (solo para los botones)
router.post('/quick-filter', async (req, res) => {
  try {
    const { operation_type } = req.body;
    
    if (!operation_type || !['Venta', 'Arriendo'].includes(operation_type)) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar un tipo de operación válido: "Venta" o "Arriendo"'
      });
    }
    
    console.log(`⚡ Filtrado rápido por: ${operation_type}`);
    
    const filters: SearchFilters = {
      operation_type: operation_type
    };
    
    const properties = await PropertyRepository.searchAdvanced(filters);
    
    res.json({
      success: true,
      filter_applied: operation_type,
      count: properties.length,
      properties: properties,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en filtrado rápido:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en filtrado rápido'
    });
  }
});

export default router;