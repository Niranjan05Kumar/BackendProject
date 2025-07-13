import { Router } from "express";
const router = Router();
import { userRegistor } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

router.route("/registor").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    userRegistor
);

export default router;
