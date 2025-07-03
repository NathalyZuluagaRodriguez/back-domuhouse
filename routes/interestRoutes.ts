import { Router } from "express"
import { getAllInterests, updateInterestStatus } from "../controllers/interestController"

const router = Router()

router.get("/interests", getAllInterests)
router.put("/interests/:idInterest", updateInterestStatus)

export default router
