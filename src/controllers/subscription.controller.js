import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID.");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found.");
    }

    const subscription = await Subscription.findOne({
        subscriber: user._id,
        channel: channelId,
    });

    if (subscription) {
        await Subscription.deleteOne({ _id: subscription._id });
        return res
            .status(200)
            .json(new ApiResponce(200, null, "Unsubscribed successfully"));
    }

    const newSubscription = await Subscription.create({
        subscriber: user._id,
        channel: channelId,
    });
    return res
        .status(201)
        .json(new ApiResponce(201, newSubscription, "Subscribed successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID.");
    }
    const subscribers = await Subscription.find({ channel: channelId });
    if (!subscribers) {
        throw new ApiError(404, "No subscribers found for this channel.");
    }
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                subscribers,
                "Subscribers fetched successfully"
            )
        );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const subscriptions = await Subscription.find({ subscriber: userId });

    if (!subscriptions || subscriptions.length === 0) {
        return res
            .status(404)
            .json(new ApiError(404, "No subscribed channels found."));
    }

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                subscriptions,
                "Subscribed channels fetched successfully"
            )
        );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
