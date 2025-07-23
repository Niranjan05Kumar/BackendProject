import { Router } from "express";
const router = Router();

import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

router.use(verifyJWT);

router.route("/").get(getUserTweets);

router.route("/create").post(createTweet);

router.route("/update/:tweetId").patch(updateTweet);

router.route("/delete/:tweetId").delete(deleteTweet);

export default router;
