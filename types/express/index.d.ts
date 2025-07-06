// types/express/index.d.ts
import { DecodedToken } from '../../middleware/authMiddleware'

declare global {
  namespace Express {
    interface Request {
      user?: {
        person_id: number
        role_id: number
        name_person?: string
        email?: string
      }
    }
  }
}
