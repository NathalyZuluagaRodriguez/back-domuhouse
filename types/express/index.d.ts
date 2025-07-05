// src/types/express/index.d.ts
import { Request } from "express"

declare global {
  namespace Express {
    interface UserPayload {
      person_id: number
      role_id: number
      name_person?: string
      email?: string
    }

    interface Request {
      user?: UserPayload
    }
  }
}
