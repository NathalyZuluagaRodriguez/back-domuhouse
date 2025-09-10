import { Request, Response } from "express";
import PropertyService from "../services/propertyServices";
import cloudinary from "../config/cloudinary";
import fs from "fs";

export async function createPropertyByUser(req: Request, res: Response) {
  try {
    /* ---------- 1. Validar ID de usuario ---------- */
    let userId = Number(req.params.userId);
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    /* ---------- 2. Validar límite de imágenes ---------- */
    let files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }
    if (files.length > 10) {
      return res.status(400).json({ error: "Maximum 10 images allowed" });
    }

    /* ---------- 3. Extraer campos del body ---------- */
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

    // Validaciones numéricas y de rango
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

      if (isNaN(numValue)) {
        return res.status(400).json({ error: `${key} must be a valid number` });
      }

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
        return res.status(400).json({ error: `${key} must be a positive number` });
      }

      if (key === "latitude" && (numValue < -90 || numValue > 90)) {
        return res.status(400).json({ error: "latitude must be between -90 and 90" });
      }

      if (key === "longitude" && (numValue < -180 || numValue > 180)) {
        return res.status(400).json({ error: "longitude must be between -180 and 180" });
      }
    }

    /* ---------- 4. Subir imágenes a Cloudinary ---------- */
    let imageUrls: string[] = [];
    try {
      let uploadPromises = files.map(async (file, idx) => {
        let result = await cloudinary.uploader.upload(file.path, {
          folder: "properties",
          public_id: `user_${userId}_prop_${Date.now()}_${idx}`,
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto" },
          ],
        });
        await fs.promises.unlink(file.path).catch(() => {});
        return result.secure_url;
      });

      imageUrls = await Promise.all(uploadPromises);
    } catch (err) {
      await Promise.allSettled(
        imageUrls.map((u) =>
          cloudinary.uploader.destroy(`properties/${u.split("/").pop()?.split(".")[0]}`)
        )
      );
      return res.status(500).json({ error: "Error uploading images" });
    }

    const imagesJson = JSON.stringify(imageUrls);

    /* ---------- 5. Guardar propiedad en DB ---------- */
    const newId = await PropertyService.createProperty(userId, {
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
      message: "Property created successfully by user",
      propertyId: newId,
      images: imageUrls,
    });
  } catch (error) {
    console.error("Error creating property by user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
