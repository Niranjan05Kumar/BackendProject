import { Router } from "express";
const router = Router();
import { userRegistor } from "../controllers/user.controller.js";

router.route("/registor").post(userRegistor);

export default router;
