import { Router, type Request, type Response } from "express"
import { validateToken } from "../middleware/authMiddleware"
import { createPropertyByUser } from "../controllers/propertyByUserController"
import db from "../config/config-db"
import upload from "../middleware/upload"

const router = Router()



router.post("/user/:userId", upload.array("images", 10), createPropertyByUser)


router.get("/perfil", validateToken, async (req: Request, res: Response) => {
  console.log("🚀 Entrando a GET /perfil")
  console.log("🧠 req.user completo:", JSON.stringify(req.user, null, 2))
  console.log("🔍 Headers de autorización:", req.headers.authorization)

  // Decodificar manualmente el token para comparar
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (token) {
      const tokenParts = token.split(".")
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString())
        console.log("🔍 Token decodificado manualmente:", JSON.stringify(payload, null, 2))
      }
    }
  } catch (e) {
    console.log("❌ Error decodificando token manualmente:", e)
  }

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

      // Verificar si existe algún usuario con ese ID
      const [checkUser] = await db.query(
        "SELECT person_id, name_person, email FROM Person WHERE person_id = ?",
        [userId]
      )
      console.log("🔍 Verificación directa del usuario:", checkUser)

      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // ✅ Usuario encontrado: extraer sus datos
    const user = rows[0]

    // Obtener estadísticas de propiedades publicadas y vendidas
    const [publicadasResult] = await db.query(
      `SELECT COUNT(*) AS total FROM Property WHERE person_id = ? AND status = 'disponible'`,
      [userId]
    )

    const [vendidasResult] = await db.query(
      `SELECT COUNT(*) AS total FROM Property WHERE person_id = ? AND status = 'vendida'`,
      [userId]
    )

    const propiedadesPublicadas = (publicadasResult as any[])[0]?.total || 0
    const propiedadesVendidas = (vendidasResult as any[])[0]?.total || 0

    // ✅ Retornar la respuesta
    return res.status(200).json({
      success: true,
      data: {
        nombre: user.nombre,
        telefono: user.telefono,
        correo: user.correo,
        verified: user.verified,
        active: user.active,
        role: userRole,
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

export default router
