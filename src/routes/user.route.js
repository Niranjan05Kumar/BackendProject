import { Router } from "express";
const router = Router();

import {
    userRegister,
    userLogin,
    userLogout,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/register").post(
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
    userRegister
);

router.route("/login").post(userLogin);

router.route("/logout").post(verifyJWT, userLogout);

export default router;
