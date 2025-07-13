import { Router } from "express";
const router = Router();
import { userRegistor, userLogin } from "../controllers/user.controller.js";
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

router.route("/login").post(userLogin);

export default router;
