import { Router } from "express";
const router = Router();

import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.use(verifyJWT);

router.route("/").get(getAllVideos);

router.route("/publish-video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishAVideo
);

router.route("/:videoId").get(getVideoById);

router.route("/update/:videoId").patch(upload.single("thumbnail"), updateVideo);

router.route("/delete/:videoId").delete(deleteVideo);

router.route("/toggle-publish-status/:videoId").patch(togglePublishStatus);

export default router;
