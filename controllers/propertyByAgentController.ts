import { Request, Response } from "express";
import PropertyService from "../services/propertyServices";
import cloudinary from "../config/cloudinary";
import fs from "fs";


/*-----------------------------------------------------------
  0. Create properties
-----------------------------------------------------------*/

export async function createProperty(req: Request, res: Response) {
  try {
    /* ---------- 1. Validar ID de agente ---------- */
    let agentId = Number(req.params.agentId);
    if (!agentId || isNaN(agentId)) {
      return res.status(400).json({ error: "Invalid agent ID" });
    }

    /* ---------- 2. Validar límite de imágenes ---------- */
    let files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 10) {
      return res.status(400).json({ error: "Maximum 10 images allowed" });
    }

    /* ---------- 3. Extraer y validar campos obligatorios ---------- */
    let {
      property_title,
      address,
      description,
      price,
      status = "Disponible",
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
      longitude,
    } = req.body;

    /* 3.1 Requeridos */
    let requiredFields = {
      property_title,
      address,
      description,
      price,
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
      longitude,
    };

    for (let [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === "") {
        return res.status(400).json({ error: `${key} is required` });
      }
    }
    let numericChecks: Record<string, any> = {
      price,
      socioeconomic_stratum,
      bedrooms,
      bathrooms,
      parking_spaces,
      built_area,
      total_area,
      latitude,
      longitude,
    };

    for (let [key, value] of Object.entries(numericChecks)) {
      const numValue = Number(value);

      // 1) Todos deben ser números
      if (isNaN(numValue)) {
        return res.status(400).json({ error: `${key} must be a valid number` });
      }

      // 2) Solo algunos campos deben ser ≥ 0
      const mustBePositive = [
        "price",
        "socioeconomic_stratum",
        "bedrooms",
        "bathrooms",
        "parking_spaces",
        "built_area",
        "total_area",
      ];

      if (mustBePositive.includes(key) && numValue < 0) {
        return res
          .status(400)
          .json({ error: `${key} must be a positive number` });
      }

      // 3) Opcional: validar rangos realistas de lat/long
      if (key === "latitude" && (numValue < -90 || numValue > 90)) {
        return res
          .status(400)
          .json({ error: "latitude must be between -90 and 90" });
      }

      if (key === "longitude" && (numValue < -180 || numValue > 180)) {
        return res
          .status(400)
          .json({ error: "longitude must be between -180 and 180" });
      }
    }


    /* ---------- 4. Subir imágenes a Cloudinary ---------- */
    let imageUrls: string[] = [];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    try {
      let uploadPromises = files.map(async (file, idx) => {
        let result = await cloudinary.uploader.upload(file.path, {
          folder: "properties",
          public_id: `agent_${agentId}_prop_${Date.now()}_${idx}`,
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto" },
          ],
        });
        await fs.promises.unlink(file.path).catch(() => { });
        return result.secure_url;
      });

      imageUrls = await Promise.all(uploadPromises);
    } catch (err) {
      /* Limpieza en caso de error */
      await Promise.allSettled(
        imageUrls.map((u) =>
          cloudinary.uploader.destroy(`properties/${u.split("/").pop()?.split(".")[0]}`)
        )
      );
      return res.status(500).json({ error: "Error uploading images" });
    }

    let imagesJson = JSON.stringify(imageUrls);

    /* ---------- 5. Llamar al servicio ---------- */
    let newId = await PropertyService.createProperty(agentId, {
      property_title,
      address,
      description,
      price: Number(price),
      status,
      property_type_id: Number(property_type_id),
      socioeconomic_stratum: Number(socioeconomic_stratum),
      city,
      neighborhood,
      operation_type,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      parking_spaces: Number(parking_spaces),
      built_area: Number(built_area),
      total_area: Number(total_area),
      latitude: Number(latitude),
      longitude: Number(longitude),
      image: imagesJson,
    });

    /* ---------- 6. Respuesta ---------- */
    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      propertyId: newId,
      images: imageUrls,
    });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/*-----------------------------------------------------------
  1. List agent’s properties
-----------------------------------------------------------*/
export async function listPropertiesByAgent(req: Request, res: Response) {
  try {
    let { agentId } = req.params;

    if (!agentId || isNaN(Number(agentId))) {
      return res.status(400).json({ error: "Invalid agent ID" });
    }

    let properties = await PropertyService.getPropertiesByAgentId(Number(agentId));
    return res.json({ properties });
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/*-----------------------------------------------------------
  2. Sold / rented list
-----------------------------------------------------------*/
export async function listSalesAndRentals(req: Request, res: Response) {
  try {
    let agentId = req.params.agentId ? Number(req.params.agentId) : undefined;

    let salesAndRentals = await PropertyService.getAgentSalesAndRentals(agentId);
    return res.json({ salesAndRentals });
  } catch (error: any) {
    console.error("Error fetching sales/rentals:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/*-----------------------------------------------------------
  3. Performance report
-----------------------------------------------------------*/
export async function getAgentPerformanceReport(req: Request, res: Response) {
  try {
    let { agentId } = req.params;

    if (!agentId || isNaN(Number(agentId))) {
      return res.status(400).json({ error: "Invalid agent ID" });
    }

    let report = await PropertyService.getAgentPerformanceReportById(Number(agentId));
    return res.json({ report });
  } catch (error: any) {
    console.error("Error generating performance report:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}


/* Ver detalle de propiedad */
export async function getProperty(req: Request, res: Response) {
  const { agentId, propertyId } = req.params;
  const property = await PropertyService.getPropertyById(
    Number(propertyId),
    Number(agentId)
  );
  if (!property) return res.status(404).json({ error: "Not found" });
  res.json({ property });
}

/* Actualizar propiedad */
export async function updateProperty(req: Request, res: Response) {
  const { agentId, propertyId } = req.params;
  const affected = await PropertyService.updatePropertyById(
    Number(propertyId),
    Number(agentId),
    req.body
  );
  if (!affected) return res.status(404).json({ error: "Not found" });
  res.json({ message: "Updated" });
}

/* Eliminar propiedad */
export async function deleteProperty(req: Request, res: Response) {
  const { agentId, propertyId } = req.params;
  const affected = await PropertyService.deletePropertyById(
    Number(propertyId),
    Number(agentId)
  );
  if (!affected) return res.status(404).json({ error: "Not found" });
  res.json({ message: "Deleted" });
}



/*-----------------------------------------------------------
  Optional default export if you prefer to import everything at once
-----------------------------------------------------------*/
export default {
  listPropertiesByAgent,
  listSalesAndRentals,
  getAgentPerformanceReport,
  getProperty,
  updateProperty,
  deleteProperty
};
