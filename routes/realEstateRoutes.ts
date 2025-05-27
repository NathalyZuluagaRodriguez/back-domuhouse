import { Router } from "express";
import registerRealEstate from "../controllers/realEstateController";

const router = Router();

router.post("/", registerRealEstate);

export default router;
