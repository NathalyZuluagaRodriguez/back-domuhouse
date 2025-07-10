import { Router, type Request, type Response } from "express"
import { validateToken } from "../middleware/authMiddleware"
import { createPropertyByUser } from "../controllers/propertyByUserController"
import db from "../config/config-db"
import upload from "../middleware/upload"

const router = Router()

// Ruta existente para crear propiedad
router.post("/user/:userId", upload.array("images", 10), createPropertyByUser)

// GET - Obtener perfil del usuario (CORREGIDO)
router.get("/getUser/perfil", validateToken, async (req: Request, res: Response) => {
  console.log("🚀 Entrando a GET /perfil")
  console.log("🧠 req.user completo:", JSON.stringify(req.user, null, 2))

  try {
    if (!req.user) {
      console.log("❌ req.user es undefined o null")
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    const userId = req.user.person_id
    const userRole = req.user.role_id
    console.log("🔍 userId extraído:", userId, "tipo:", typeof userId)
    console.log("🔍 userRole extraído:", userRole, "tipo:", typeof userRole)

    if (!userId) {
      console.log("❌ person_id no encontrado en req.user")
      return res.status(401).json({
        success: false,
        message: "ID de usuario no válido",
      })
    }

    // ✅ CONSULTA CORREGIDA - Sin created_at
    const sql = `
      SELECT 
        p.person_id AS id,
        p.name_person AS nombre,
        p.phone AS telefono,
        p.email AS correo,
        p.verified,
        p.active
      FROM Person p
      WHERE p.person_id = ?
    `

    console.log("🔍 Ejecutando consulta SQL para userId:", userId)
    const [results] = await db.query(sql, [userId])
    const rows = results as any[]
    console.log("🔍 Resultados de la consulta:", JSON.stringify(rows, null, 2))

    if (rows.length === 0) {
      console.log("❌ Usuario no encontrado en la base de datos")
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    const user = rows[0]

    // Obtener estadísticas de propiedades
    const [publicadasResult] = await db.query(
      `SELECT COUNT(*) AS total FROM Property WHERE person_id = ? AND status = 'Disponible'`,
      [userId],
    )
    const [vendidasResult] = await db.query(
      `SELECT COUNT(*) AS total FROM Property WHERE person_id = ? AND status = 'Vendida'`,
      [userId],
    )

    const propiedadesPublicadas = (publicadasResult as any[])[0]?.total || 0
    const propiedadesVendidas = (vendidasResult as any[])[0]?.total || 0

    return res.status(200).json({
      success: true,
      data: {
        nombre: user.nombre,
        telefono: user.telefono || "",
        correo: user.correo,
        verified: user.verified,
        active: user.active,
        role: userRole,
        fechaRegistro: new Date().toISOString(), // Fecha actual como fallback
        propiedadesPublicadas,
        propiedadesVendidas,
      },
    })
  } catch (error) {
    console.error("❌ Error completo:", error)
    return res.status(500).json({
      success: false,
      message: "Error del servidor al obtener el perfil",
    })
  }
})

// PUT - Actualizar perfil del usuario (sin cambios, ya está bien)
router.put("/update/perfil", validateToken, async (req: Request, res: Response) => {
  console.log("🚀 Entrando a PUT /perfil")
  console.log("🔍 Datos recibidos:", req.body)

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    const userId = req.user.person_id
    const { nombre, telefono, correo } = req.body

    // Validaciones
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: "El nombre es obligatorio",
      })
    }

    if (!correo || !correo.trim()) {
      return res.status(400).json({
        success: false,
        message: "El correo es obligatorio",
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(correo)) {
      return res.status(400).json({
        success: false,
        message: "El formato del correo no es válido",
      })
    }

    // Verificar si el correo ya existe
    const [emailCheck] = await db.query("SELECT person_id FROM Person WHERE email = ? AND person_id != ?", [
      correo,
      userId,
    ])

    if ((emailCheck as any[]).length > 0) {
      return res.status(400).json({
        success: false,
        message: "El correo ya está en uso por otro usuario",
      })
    }

    // Actualización
    const updateSql = `
      UPDATE Person 
      SET name_person = ?, phone = ?, email = ?
      WHERE person_id = ?
    `

    await db.query(updateSql, [nombre.trim(), telefono?.trim(), correo.trim(), userId])

    // Obtener los datos actualizados
    const [updatedUser] = await db.query(
      "SELECT name_person AS nombre, phone AS telefono, email AS correo FROM Person WHERE person_id = ?",
      [userId],
    )

    const userData = (updatedUser as any[])[0]

    console.log("✅ Perfil actualizado exitosamente")
    return res.status(200).json({
      success: true,
      message: "Perfil actualizado exitosamente",
      data: userData,
    })
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error)
    return res.status(500).json({
      success: false,
      message: "Error del servidor al actualizar el perfil",
    })
  }
})

// ✅ RUTA CORREGIDA - Obtener propiedades del usuario
router.get("/properties/mis-propiedades/:userId", validateToken, async (req: Request, res: Response) => {
  console.log("🚀 Entrando a GET /properties/mis-propiedades/:userId")

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    const userId = req.params.userId
    const { tipo } = req.query // 'publicadas', 'vendidas', 'todas'

    let whereClause = "WHERE p.person_id = ?"
    const params = [userId]

    if (tipo === "publicadas") {
      whereClause += " AND p.status = 'Disponible'"
    } else if (tipo === "vendidas") {
      whereClause += " AND p.status = 'Vendida'"
    }

    // ✅ CONSULTA CORREGIDA para propiedades
    const sql = `
      SELECT 
        p.property_id,
        p.property_title,
        p.address,
        p.description,
        p.image,
        p.price,
        p.status,
        p.operation_type,
        p.bedrooms,
        p.bathrooms,
        p.built_area,
        p.total_area,
        p.publish_date
      FROM Property p
      ${whereClause}
      ORDER BY p.publish_date DESC
    `

    const [results] = await db.query(sql, params)
    const propiedades = results as any[]

    console.log(`✅ Se encontraron ${propiedades.length} propiedades`)

    return res.status(200).json({
      success: true,
      total: propiedades.length,
      properties: propiedades,
    })
  } catch (error) {
    console.error("❌ Error al obtener propiedades:", error)
    return res.status(500).json({
      success: false,
      message: "Error del servidor al obtener las propiedades",
    })
  }
})

// GET - Obtener detalles de una propiedad específica
router.get("/propiedad/:id", validateToken, async (req: Request, res: Response) => {
  console.log("🚀 Entrando a GET /propiedad/:id")

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    const userId = req.user.person_id
    const propertyId = req.params.id

    // Obtener detalles de la propiedad
    const sql = `
      SELECT 
        p.*
      FROM Property p
      WHERE p.property_id = ? AND p.person_id = ?
    `

    const [results] = await db.query(sql, [propertyId, userId])
    const properties = results as any[]

    if (properties.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Propiedad no encontrada",
      })
    }

    const property = properties[0]

    // Procesar imágenes si existen
    if (property.image) {
      try {
        property.images = JSON.parse(property.image)
      } catch {
        property.images = [property.image]
      }
    } else {
      property.images = []
    }

    return res.status(200).json({
      success: true,
      data: property,
    })
  } catch (error) {
    console.error("❌ Error al obtener detalles de la propiedad:", error)
    return res.status(500).json({
      success: false,
      message: "Error del servidor al obtener los detalles de la propiedad",
    })
  }
})

// PUT - Actualizar propiedad
router.put("/propiedad/:id", validateToken, upload.array("images", 10), async (req: Request, res: Response) => {
  console.log("🚀 Entrando a PUT /propiedad/:id")

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    const userId = req.user.person_id
    const propertyId = req.params.id
    const {
      property_title,
      address,
      price,
      bedrooms,
      bathrooms,
      built_area,
      description,
      property_type_id,
      operation_type,
      status,
    } = req.body

    // Verificar que la propiedad pertenece al usuario
    const [ownerCheck] = await db.query("SELECT property_id FROM Property WHERE property_id = ? AND person_id = ?", [
      propertyId,
      userId,
    ])

    if ((ownerCheck as any[]).length === 0) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para editar esta propiedad",
      })
    }

    // Actualizar la propiedad
    const updateSql = `
      UPDATE Property 
      SET property_title = ?, address = ?, price = ?, bedrooms = ?, bathrooms = ?,
          built_area = ?, description = ?, property_type_id = ?, operation_type = ?,
          status = ?
      WHERE property_id = ? AND person_id = ?
    `

    await db.query(updateSql, [
      property_title,
      address,
      price,
      bedrooms,
      bathrooms,
      built_area,
      description,
      property_type_id,
      operation_type,
      status,
      propertyId,
      userId,
    ])

    // Si hay nuevas imágenes, procesarlas
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      console.log("📸 Nuevas imágenes recibidas:", (req.files as Express.Multer.File[]).length)
    }

    return res.status(200).json({
      success: true,
      message: "Propiedad actualizada exitosamente",
    })
  } catch (error) {
    console.error("❌ Error al actualizar propiedad:", error)
    return res.status(500).json({
      success: false,
      message: "Error del servidor al actualizar la propiedad",
    })
  }
})

// DELETE - Eliminar propiedad
router.delete("/propiedad/:id", validateToken, async (req: Request, res: Response) => {
  console.log("🚀 Entrando a DELETE /propiedad/:id")

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    const userId = req.user.person_id
    const propertyId = req.params.id

    // Verificar que la propiedad pertenece al usuario
    const [ownerCheck] = await db.query("SELECT property_id FROM Property WHERE property_id = ? AND person_id = ?", [
      propertyId,
      userId,
    ])

    if ((ownerCheck as any[]).length === 0) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar esta propiedad",
      })
    }

    // Eliminar la propiedad
    await db.query("DELETE FROM Property WHERE property_id = ? AND person_id = ?", [propertyId, userId])

    return res.status(200).json({
      success: true,
      message: "Propiedad eliminada exitosamente",
    })
  } catch (error) {
    console.error("❌ Error al eliminar propiedad:", error)
    return res.status(500).json({
      success: false,
      message: "Error del servidor al eliminar la propiedad",
    })
  }
})

export default router
