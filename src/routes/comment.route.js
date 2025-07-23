import { Router } from "express";
const router = Router();

import {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.use(verifyJWT);

router.route("/add-comment/:videoId").post(addComment);

router.route("/get-comments/:videoId").get(getVideoComments);

router.route("/update-comment/:commentId").patch(updateComment);

router.route("/delete-comment/:commentId").delete(deleteComment);

export default router;
