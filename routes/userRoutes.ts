import { Router, type Request, type Response, type Express } from "express"
import { validateToken } from "../middleware/authMiddleware"
import { createPropertyByUser } from "../controllers/propertyByUserController"
import db from "../config/config-db"
import upload from "../middleware/upload"

const router = Router()

// Ruta existente para crear propiedad
router.post("/user/:userId", upload.array("images", 10), createPropertyByUser)

// GET - Obtener perfil del usuario
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

    // Consulta mejorada para incluir teléfono y fecha de registro
    const sql = `
      SELECT 
        p.person_id AS id,
        p.name_person AS nombre,
        p.phone AS telefono,
        p.email AS correo,
        p.verified,
        p.active,
        p.created_at AS fechaRegistro
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
      `SELECT COUNT(*) AS total FROM Property WHERE person_id = ? AND status = 'disponible'`,
      [userId],
    )

    const [vendidasResult] = await db.query(
      `SELECT COUNT(*) AS total FROM Property WHERE person_id = ? AND status = 'vendida'`,
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
        fechaRegistro: user.fechaRegistro,
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

// PUT - Actualizar perfil del usuario (versión corregida)
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

    // Validaciones (mantén las mismas validaciones que ya tienes)
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
    const [emailCheck] = await db.query(
      "SELECT person_id FROM Person WHERE email = ? AND person_id != ?", 
      [correo, userId]
    )

    if ((emailCheck as any[]).length > 0) {
      return res.status(400).json({
        success: false,
        message: "El correo ya está en uso por otro usuario",
      })
    }

    // ACTUALIZACIÓN CORREGIDA (sin updated_at)
    const updateSql = `
      UPDATE Person 
      SET name_person = ?, phone = ?, email = ?
      WHERE person_id = ?
    `

    await db.query(updateSql, [
      nombre.trim(), 
      telefono?.trim(), 
      correo.trim(), 
      userId
    ])

    // Obtener los datos actualizados
    const [updatedUser] = await db.query(
      "SELECT name_person AS nombre, phone AS telefono, email AS correo FROM Person WHERE person_id = ?",
      [userId]
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

// GET - Obtener propiedades del usuario
router.get("/mis-propiedades", validateToken, async (req: Request, res: Response) => {
  console.log("🚀 Entrando a GET /mis-propiedades")

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    const userId = req.user.person_id
    const { tipo } = req.query // 'publicadas', 'vendidas', 'todas'

    let whereClause = "WHERE p.person_id = ?"
    const params = [userId]

    if (tipo === "publicadas") {
      whereClause += " AND p.status = 'disponible'"
    } else if (tipo === "vendidas") {
      whereClause += " AND p.status = 'vendida'"
    }

  const sql = `
  SELECT 
    p.person_id AS id,
    p.name_person AS nombre,
    p.phone AS telefono,
    p.email AS correo,
    p.verified,
    p.active
    // ⬅️ Sin fechaRegistro
  FROM Person p
  WHERE p.person_id = ?
`;

    const [results] = await db.query(sql, params)
    const propiedades = results as any[]

    console.log(`✅ Se encontraron ${propiedades.length} propiedades`)
    return res.status(200).json({
      success: true,
      data: propiedades,
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
        p.*,
        GROUP_CONCAT(pi.image_url) AS images
      FROM Property p
      LEFT JOIN PropertyImage pi ON p.property_id = pi.property_id
      WHERE p.property_id = ? AND p.person_id = ?
      GROUP BY p.property_id
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
    if (property.images) {
      property.images = property.images.split(",")
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
    const { title, address, price, rooms, bathrooms, area, description, property_type, transaction_type, status } =
      req.body

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
      SET title = ?, address = ?, price = ?, rooms = ?, bathrooms = ?, 
          area = ?, description = ?, property_type = ?, transaction_type = ?, 
          status = ?, updated_at = NOW()
      WHERE property_id = ? AND person_id = ?
    `

    await db.query(updateSql, [
      title,
      address,
      price,
      rooms,
      bathrooms,
      area,
      description,
      property_type,
      transaction_type,
      status,
      propertyId,
      userId,
    ])

    // Si hay nuevas imágenes, procesarlas
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      // Aquí puedes agregar lógica para manejar las nuevas imágenes
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

    // Eliminar imágenes asociadas primero
    await db.query("DELETE FROM PropertyImage WHERE property_id = ?", [propertyId])

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
