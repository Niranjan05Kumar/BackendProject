import { Router } from "express";
const router = Router();
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.use(verifyJWT);

router.route("/").get((req, res) => res.send("Likes API"));

router.route("/liked-videos").get(getLikedVideos);

router.route("/like/video/:videoId").post(toggleVideoLike);

router.route("/like/comment/:commentId").post(toggleCommentLike);

router.route("/like/tweet/:tweetId").post(toggleTweetLike);

export default router;
