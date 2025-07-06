import express, { type Request, type Response } from "express"
import { validateToken } from "../middleware/authMiddleware"
import db from "../config/config-db"

const router = express.Router()

// ✅ FIXED: Remove admin-only restriction, allow all authenticated users
router.get("/perfil", validateToken, async (req: Request, res: Response) => {
  console.log("🚀 Entrando a GET /perfil")
  console.log("🧠 req.user:", req.user)

  try {
    if (!req.user) {
      console.log("❌ req.user es undefined o null")
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    const userId = req.user.person_id
    const userRole = req.user.role_id || req.user.role_id
    console.log("🔍 userId extraído:", userId)
    console.log("🔍 userRole extraído:", userRole)

    if (!userId) {
      console.log("❌ person_id no encontrado en req.user")
      return res.status(401).json({
        success: false,
        message: "ID de usuario no válido",
      })
    }

    // ✅ FIXED: Allow access for all authenticated users, not just admins
    // Remove the admin check that was causing the 401 error for role 2 users

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

    console.log("🔍 Resultados de la consulta:", rows)

    if (rows.length === 0) {
      console.log("❌ Usuario no encontrado en la base de datos")
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    const perfil = rows[0]
    console.log("✅ Perfil encontrado:", perfil)

    // Get property counts in separate queries to avoid complex joins
    let propiedadesPublicadas = 0
    let propiedadesVendidas = 0

    try {
      // Count published properties
      const [propPublicadas] = await db.query("SELECT COUNT(*) as count FROM Property WHERE person_id = ?", [userId])
      propiedadesPublicadas = (propPublicadas as any[])[0]?.count || 0

      // Count sold properties
      const [propVendidas] = await db.query(
        "SELECT COUNT(*) as count FROM Property WHERE person_id = ? AND status = ?",
        [userId, "Vendida"],
      )
      propiedadesVendidas = (propVendidas as any[])[0]?.count || 0
    } catch (propError) {
      console.log("⚠️ Error al contar propiedades, usando valores por defecto:", propError)
      // Keep default values of 0
    }

    const responseData = {
      nombre: perfil.nombre || "",
      telefono: perfil.telefono || "",
      correo: perfil.correo || "",
      fechaRegistro: new Date().toISOString(), // Use current date as fallback since created_at doesn't exist
      propiedadesPublicadas: propiedadesPublicadas,
      propiedadesVendidas: propiedadesVendidas,
      verified: perfil.verified,
      active: perfil.active,
      role: userRole, // Include role in response for frontend debugging
    }

    console.log("✅ Enviando respuesta:", responseData)

    res.status(200).json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error("❌ Error al obtener perfil:", error)
    res.status(500).json({
      success: false,
      message: "Error del servidor al obtener el perfil",
    })
  }
})

// ✅ FIXED: PUT route for updating profile (also allow all authenticated users)
router.put("/perfil", validateToken, async (req: Request, res: Response) => {
  console.log("🚀 Entrando a PUT /perfil")
  console.log("🧠 req.user:", req.user)
  console.log("🧠 req.body:", req.body)

  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    const userId = req.user.person_id
    const userRole = req.user.role_id || req.user.role_id
    const { nombre, telefono, correo } = req.body

    // Basic validation
    if (!nombre || !correo) {
      return res.status(400).json({
        success: false,
        message: "Nombre y correo son obligatorios",
      })
    }

    // Update user data
    const updateSql = `
      UPDATE Person 
      SET name_person = ?, phone = ?, email = ?
      WHERE person_id = ?
    `

    await db.query(updateSql, [nombre, telefono || null, correo, userId])

    // Get updated data
    const [results] = await db.query(
      "SELECT person_id AS id, name_person AS nombre, phone AS telefono, email AS correo, verified, active FROM Person WHERE person_id = ?",
      [userId],
    )
    const rows = results as any[]

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado después de la actualización",
      })
    }

    const updatedPerfil = rows[0]

    // Get property counts
    let propiedadesPublicadas = 0
    let propiedadesVendidas = 0

    try {
      const [propPublicadas] = await db.query("SELECT COUNT(*) as count FROM Property WHERE person_id = ?", [userId])
      propiedadesPublicadas = (propPublicadas as any[])[0]?.count || 0

      const [propVendidas] = await db.query(
        "SELECT COUNT(*) as count FROM Property WHERE person_id = ? AND status = ?",
        [userId, "Vendida"],
      )
      propiedadesVendidas = (propVendidas as any[])[0]?.count || 0
    } catch (propError) {
      console.log("⚠️ Error al contar propiedades:", propError)
    }

    const responseData = {
      nombre: updatedPerfil.nombre || "",
      telefono: updatedPerfil.telefono || "",
      correo: updatedPerfil.correo || "",
      fechaRegistro: new Date().toISOString(),
      propiedadesPublicadas: propiedadesPublicadas,
      propiedadesVendidas: propiedadesVendidas,
      verified: updatedPerfil.verified,
      active: updatedPerfil.active,
      role: userRole,
    }

    console.log("✅ Perfil actualizado:", responseData)

    res.status(200).json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error)
    res.status(500).json({
      success: false,
      message: "Error del servidor al actualizar el perfil",
    })
  }
})

export default router
