// controllers/propertyController.ts
import { Request, Response } from 'express';
import Promisepool from '../config/config-db';
import cloudinary from '../config/cloudinary';
import fs from 'fs';

export const createProperty = async (req: Request, res: Response) => {
  try {
    console.log('🏠 createProperty - Iniciando...');
    console.log('📋 Body recibido:', req.body);
    console.log('📷 Files recibidos:', req.files);

    const {
      address,
      property_title,
      description,
      price,
      status,
      person_id, // ✅ Ahora debe enviarse en el body
      property_type_id,
      socioeconomic_stratum,
      city,
      neighborhood,
      operation_type,
      bedrooms,
      bathrooms,
      parking_spaces,
      built_area,
      total_area,
      latitude,
      longitude
    } = req.body;

    // ✅ Validar archivos
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 10) {
      return res.status(400).json({ error: 'Máximo 10 imágenes permitidas' });
    }

    // ✅ Validar campos requeridos básicos
    const requiredFields = {
      address: address,
      property_title,
      description,
      price,
      person_id, // ✅ Ahora requerido en el body
      property_type_id,
      city,
      neighborhood,
      operation_type
    };

    console.log('🔍 Validando campos requeridos:', requiredFields);

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value || value === '' || value === 'undefined') {
        console.error(`❌ Campo faltante: ${key} = ${value}`);
        return res.status(400).json({ 
          error: `El campo ${key} es requerido`,
          received: value,
          allFields: req.body
        });
      }
    }

    // ✅ Validar tipos numéricos
    const numericValidation = {
      price: { value: price, required: true },
      person_id: { value: person_id, required: true },
      property_type_id: { value: property_type_id, required: true },
      bedrooms: { value: bedrooms, required: false },
      bathrooms: { value: bathrooms, required: false },
      parking_spaces: { value: parking_spaces, required: false },
      built_area: { value: built_area, required: false },
      total_area: { value: total_area, required: false }
    };

    for (const [key, config] of Object.entries(numericValidation)) {
      if (config.value !== undefined && config.value !== null && config.value !== '') {
        const numValue = Number(config.value);
        if (isNaN(numValue) || numValue < 0) {
          return res.status(400).json({ 
            error: `El campo ${key} debe ser un número válido mayor o igual a 0`,
            received: config.value
          });
        }
      } else if (config.required) {
        return res.status(400).json({ 
          error: `El campo ${key} es requerido`,
          received: config.value
        });
      }
    }

    // ✅ Subir imágenes a Cloudinary (si existen)
    let imageUrls: string[] = [];
    let imagesJson = '[]';

    if (files && files.length > 0) {
      console.log(`📤 Subiendo ${files.length} imágenes a Cloudinary...`);
      
      const uploadPromises = files.map(async (file, index) => {
        try {
          console.log(`📷 Subiendo imagen ${index + 1}: ${file.originalname}`);
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'properties',
            public_id: `property_${Date.now()}_${index}`,
            transformation: [
              { width: 1200, height: 800, crop: 'limit' },
              { quality: 'auto' }
            ]
          });
          
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          
          console.log(`✅ Imagen ${index + 1} subida: ${result.secure_url}`);
          return result.secure_url;
        } catch (error) {
          console.error(`❌ Error subiendo imagen ${file.originalname}:`, error);
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          throw new Error(`Error subiendo imagen ${file.originalname}: ${error}`);
        }
      });

      try {
        imageUrls = await Promise.all(uploadPromises);
        imagesJson = JSON.stringify(imageUrls);
        console.log(`✅ Todas las imágenes subidas exitosamente: ${imageUrls.length} imágenes`);
      } catch (uploadError) {
        console.error('❌ Error en la subida de imágenes:', uploadError);
        return res.status(500).json({ 
          error: 'Error subiendo las imágenes',
          detail: uploadError instanceof Error ? uploadError.message : 'Error desconocido'
        });
      }
    }

    // ✅ Preparar datos para el stored procedure (según tu BD)
    const propertyData = [
      address,
      property_title,
      description,
      imagesJson,
      parseFloat(price),
      status || 'Disponible',
      parseInt(person_id),
      parseInt(property_type_id),
      parseInt(socioeconomic_stratum) || 3,
      city,
      neighborhood,
      operation_type,
      parseInt(bedrooms) || 0,
      parseInt(bathrooms) || 0,
      parseInt(parking_spaces) || 0,
      parseFloat(built_area) || 0,
      parseFloat(total_area) || parseFloat(built_area) || 0,
      parseFloat(latitude) || 0,
      parseFloat(longitude) || 0
    ];

    console.log('💾 Datos para stored procedure:', propertyData);

    // ✅ Guardar en la base de datos usando tu procedimiento
    try {
      const [result]: any = await Promisepool.query(
        'CALL sp_create_property(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        propertyData
      );

      console.log('✅ Resultado del stored procedure:', result);
      
      // ✅ La propiedad se crea con approved = TRUE según tu procedimiento
      console.log('✅ Propiedad creada exitosamente');
      
      res.status(201).json({
        success: true,
        message: 'Propiedad creada exitosamente',
        property: {
          title: property_title,
          address: address,
          price: parseFloat(price),
          city: city,
          neighborhood: neighborhood,
          operation_type: operation_type,
          images: imageUrls,
          imagesCount: imageUrls.length
        }
      });

    } catch (dbError: any) {
      console.error('❌ Error en la base de datos:', dbError);
      
      // Limpiar imágenes de Cloudinary en caso de error
      if (imageUrls.length > 0) {
        console.log('🧹 Limpiando imágenes de Cloudinary debido a error en BD...');
        imageUrls.forEach(async (url) => {
          try {
            const publicId = url.split('/').pop()?.split('.')[0];
            if (publicId) {
              await cloudinary.uploader.destroy(`properties/${publicId}`);
            }
          } catch (cleanupError) {
            console.error('⚠️ Error limpiando imagen:', cleanupError);
          }
        });
      }

      return res.status(500).json({ 
        error: 'Error al guardar en la base de datos', 
        detail: dbError.message,
        sqlMessage: dbError.sqlMessage,
        code: dbError.code
      });
    }

  } catch (error: any) {
    console.error('❌ Error general en createProperty:', error);
    
    // Limpiar archivos temporales en caso de error general
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({ 
      error: 'Error interno del servidor al crear la propiedad', 
      detail: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const editProperty = async (req: Request, res: Response) => {
  try {
    console.log('✏️ editProperty - ID:', req.params.id);
    const { id } = req.params;
    const {
      property_title, adress, description, price, status, socioeconomic_stratum,
      city, neighborhood, operation_type, bedrooms, bathrooms, parking_spaces,
      built_area, total_area, latitude, longitude
    } = req.body;

    const [result] = await Promisepool.query(
      'CALL sp_edit_property(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, property_title, adress, description, price, status, socioeconomic_stratum,
        city, neighborhood, operation_type, bedrooms, bathrooms, parking_spaces,
        built_area, total_area, latitude, longitude
      ]
    );

    console.log('✅ Property updated successfully');
    res.json({ 
      success: true,
      message: 'Property updated successfully', 
      result 
    });
  } catch (error: any) {
    console.error('❌ Error in editProperty:', error);
    res.status(500).json({ 
      error: 'Error updating property', 
      detail: error.message 
    });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    console.log('🗑️ deleteProperty - ID:', req.params.id);
    const { id } = req.params;
    
    await Promisepool.query('CALL sp_delete_property(?)', [id]);
    
    console.log('✅ Property deleted successfully');
    res.json({ 
      success: true,
      message: 'Property deleted successfully' 
    });
  } catch (error: any) {
    console.error('❌ Error in deleteProperty:', error);
    res.status(500).json({ 
      error: 'Error deleting property', 
      detail: error.message 
    });
  }
};

export const approveProperty = async (req: Request, res: Response) => {
  try {
    console.log('✅ approveProperty - Iniciando...');
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Property ID is required' });
    }

    await Promisepool.query('CALL sp_approve_property(?)', [id]);

    console.log(`🏠 Propiedad con ID ${id} aprobada correctamente`);
    res.status(200).json({ 
      success: true,
      message: 'Property approved successfully' 
    });
  } catch (error: any) {
    console.error('❌ Error en approveProperty:', error);
    res.status(500).json({ 
      error: 'Error approving property', 
      detail: error.message 
    });
  }
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    console.log('📋 getProperties - Obteniendo todas las propiedades...');
    const [result] = await Promisepool.query('CALL sp_list_approved_properties()');
    const properties = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : [];
    
    console.log(`✅ Se encontraron ${properties.length} propiedades`);
    res.json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error: any) {
    console.error('❌ Error in getProperties:', error);
    res.status(500).json({ 
      error: 'Error retrieving properties', 
      detail: error.message 
    });
  }
};



export const getApprovedProperties = async (req: Request, res: Response) => {
  try {
    console.log('✅ getApprovedProperties - Obteniendo propiedades aprobadas...');
    const [rows]: any = await Promisepool.query('CALL sp_list_approved_properties()');
    const properties = Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : [];
    
    console.log(`✅ Se encontraron ${properties.length} propiedades aprobadas`);
    res.json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error: any) {
    console.error('❌ Error in getApprovedProperties:', error);
    res.status(500).json({ 
      error: 'Error retrieving approved properties', 
      detail: error.message 
    });
  }
};

export const getPropertiesByType = async (req: Request, res: Response) => {
  try {
    console.log('🏠 getPropertiesByType - Tipo:', req.params.property_type_id);
    const { property_type_id } = req.params;

    if (isNaN(Number(property_type_id))) {
      return res.status(400).json({ 
        error: 'El ID de tipo de propiedad debe ser un número válido' 
      });
    }

    const [result] = await Promisepool.query(
      'SELECT * FROM Property WHERE property_type_id = ? AND approved = TRUE',
      [property_type_id]
    );

    if (Array.isArray(result) && result.length === 0) {
      return res.status(404).json({ 
        mensaje: 'No se encontraron propiedades para este tipo',
        property_type_id: property_type_id
      });
    }

    console.log(`✅ Se encontraron ${Array.isArray(result) ? result.length : 0} propiedades del tipo ${property_type_id}`);
    res.json({ 
      success: true,
      count: Array.isArray(result) ? result.length : 0,
      property_type_id: property_type_id,
      properties: result 
    });
  } catch (error: any) {
    console.error('❌ Error al obtener propiedades por tipo:', error);
    res.status(500).json({ 
      error: error.sqlMessage || 'Error interno', 
      detail: error.message 
    });
  }
};


// ✅ Función getPropertyById CORREGIDA
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    console.log('🏠 getPropertyById - ID:', req.params.id);
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        error: 'ID de propiedad es requerido',
        success: false 
      });
    }

    const propertyId = parseInt(id);
    if (isNaN(propertyId) || propertyId <= 0) {
      return res.status(400).json({ 
        error: 'ID de propiedad debe ser un número válido mayor a 0',
        success: false 
      });
    }

    console.log('🔍 Buscando propiedad con ID válido:', propertyId);

    const [result]: any = await Promisepool.execute(
      `SELECT 
        p.*,
        pt.type_name as property_type_name,
        CONCAT(per.name_person, ' ', per.last_name) as agent_name,
        per.email as agent_email,
        per.phone as agent_phone
      FROM Property p
      LEFT JOIN PropertyType pt ON p.property_type_id = pt.property_type_id
      LEFT JOIN Person per ON p.person_id = per.person_id
      WHERE p.property_id = ?`,
      [propertyId]
    );

    console.log('📊 Resultado de la consulta:', result ? result.length : 'No hay resultado');

    if (!result || result.length === 0) {
      return res.status(404).json({ 
        error: 'Propiedad no encontrada',
        message: 'La propiedad solicitada no existe',
        success: false,
        property_id: propertyId
      });
    }

    const property = result[0];

    if (!property.approved) {
      return res.status(403).json({
        error: 'Propiedad no disponible',
        message: 'La propiedad no está aprobada para visualización pública',
        success: false
      });
    }

    // ✅ PROCESAR IMÁGENES CORRECTAMENTE
    let processedImages: string[] = [];
    
    if (property.image && typeof property.image === 'string') {
      try {
        const parsedImages = JSON.parse(property.image);
        console.log('🖼️ Imágenes parseadas:', parsedImages);
        
        if (Array.isArray(parsedImages)) {
          processedImages = parsedImages.filter(url => 
            url && 
            url.trim() !== '' && 
            (url.startsWith('http') || url.startsWith('/'))
          );
        }
      } catch (parseError) {
        console.warn('⚠️ Error parsing images JSON:', parseError);
        
        // Si no se puede parsear, asumir que es una sola URL
        if (property.image.trim() !== '') {
          processedImages = [property.image];
        }
      }
    }

    // ✅ ESTRUCTURA DE RESPUESTA CORREGIDA
    const formattedProperty = {
      property_id: property.property_id,
      property_title: property.property_title,
      title: property.property_title, // Para compatibilidad con frontend
      description: property.description,
      price: property.price,
      address: property.address,
      city: property.city,
      neighborhood: property.neighborhood,
      operation_type: property.operation_type,
      property_type: property.property_type_name,
      property_type_id: property.property_type_id,
      socioeconomic_stratum: property.socioeconomic_stratum,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      parking_spaces: property.parking_spaces,
      built_area: property.built_area,
      total_area: property.total_area,
      latitude: property.latitude,
      longitude: property.longitude,
      status: property.status,
      approved: property.approved,
      publish_date: property.publish_date,
      
      // ✅ CAMPOS QUE EL FRONTEND ESPERA
      agent_name: property.agent_name || 'Agente Inmobiliario',
      agent_email: property.agent_email || 'contacto@inmobiliaria.com',
      agent_phone: property.agent_phone || '+57 300 000 0000',
      
      // ✅ IMÁGENES PROCESADAS
      images: processedImages,
      image_urls: processedImages // Para compatibilidad adicional
    };

    console.log(`✅ Propiedad encontrada exitosamente: ${formattedProperty.property_title}`);
    console.log(`🖼️ Imágenes procesadas: ${processedImages.length} URLs`);
    
    res.status(200).json({
      success: true,
      property: formattedProperty,
      message: 'Propiedad obtenida correctamente'
    });

  } catch (error: any) {
    console.error('❌ Error completo in getPropertyById:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      sql: error.sql
    });
    
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener la propiedad', 
      detail: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
};

// ✅ Función getPropertyImages CORREGIDA
export const getPropertyImages = async (req: Request, res: Response) => {
  try {
    console.log('🖼️ getPropertyImages - ID:', req.params.id);
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        error: 'ID de propiedad es requerido',
        success: false 
      });
    }

    const propertyId = parseInt(id);
    if (isNaN(propertyId) || propertyId <= 0) {
      return res.status(400).json({ 
        error: 'ID de propiedad debe ser un número válido mayor a 0',
        success: false 
      });
    }

    console.log('🔍 Buscando imágenes para propiedad ID:', propertyId);

    const [result]: any = await Promisepool.execute(
      `SELECT 
        property_id,
        property_title,
        image,
        approved
      FROM Property 
      WHERE property_id = ?`,
      [propertyId]
    );

    if (!result || result.length === 0) {
      return res.status(404).json({ 
        error: 'Propiedad no encontrada',
        success: false,
        property_id: propertyId
      });
    }

    const property = result[0];

    if (!property.approved) {
      return res.status(403).json({
        error: 'Propiedad no disponible',
        success: false
      });
    }

    // ✅ PROCESAR IMÁGENES EN FORMATO ESPERADO POR EL FRONTEND
    let images: any[] = [];
    
    if (property.image && typeof property.image === 'string') {
      try {
        const parsedImages = JSON.parse(property.image);
        console.log('🔍 Imágenes parseadas:', parsedImages);
        
        if (Array.isArray(parsedImages)) {
          images = parsedImages
            .filter(url => url && url.trim() !== '' && (url.startsWith('http') || url.startsWith('/')))
            .map((imageUrl: string, index: number) => ({
              id: index + 1,
              url: imageUrl,
              is_main: index === 0,
              property_id: propertyId,
              order: index + 1,
              alt: `Imagen ${index + 1} de ${property.property_title}`
            }));
        }
      } catch (parseError) {
        console.warn('⚠️ Error parsing images JSON:', parseError);
        
        if (property.image.trim() !== '') {
          images = [{
            id: 1,
            url: property.image,
            is_main: true,
            property_id: propertyId,
            order: 1,
            alt: `Imagen principal de ${property.property_title}`
          }];
        }
      }
    }

    console.log(`✅ Se procesaron ${images.length} imágenes válidas`);
    console.log('🖼️ URLs procesadas:', images.map(img => img.url));
    
    res.status(200).json({
      success: true,
      property_id: propertyId,
      property_title: property.property_title,
      images: images,
      images_count: images.length,
      message: `${images.length} imágenes obtenidas correctamente`
    });

  } catch (error: any) {
    console.error('❌ Error completo in getPropertyImages:', error);
    
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener las imágenes', 
      detail: error.message,
      success: false,
      timestamp: new Date().toISOString()
    });
  }
};


export const getPropertiesForAdmin = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.id;

    const {
      estado = null,
      tipo = null,
      agente = null,
      busqueda = null
    } = req.query;

    const [result]: any = await Promisepool.query(
      'CALL sp_filter_properties_by_real_estate(?, ?, ?, ?, ?)',
      [adminId, estado, tipo, agente, busqueda]
    );

    const properties = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : [];

    res.status(200).json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error: any) {
    console.error('❌ Error al obtener propiedades del administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener propiedades',
      error: error.message
    });
  }
};

