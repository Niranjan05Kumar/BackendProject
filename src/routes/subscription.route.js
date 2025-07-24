import { Router } from "express";
const router = Router();
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.use(verifyJWT);

router.route("/").get((req, res) => {
    res.send("Subscription API is working");
});

router.route("/subscription/:channelId").put(toggleSubscription);

router.route("/subscribers/:channelId").get(getUserChannelSubscribers);

router.route("/subscribed-channels").get(getSubscribedChannels);

export default router;
