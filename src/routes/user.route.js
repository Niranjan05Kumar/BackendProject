import { Router } from "express";
const router = Router();

import {
    userRegister,
    userLogin,
    userLogout,
    refreshingAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage,
    getUserChannelProfile,
    getWatchHistory,
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

router.route("/refresh-token").post(refreshingAccessToken);

router.route("/change-current-password").post(verifyJWT, changeCurrentPassword);

router.route("/get-current-user").get(verifyJWT, getCurrentUser);

router.route("/update-account-details").patch(verifyJWT, updateAccountDetails);

router.route("/update-user-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router.route("/update-user-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUsercoverImage);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;
