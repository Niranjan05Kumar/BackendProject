import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;
    const userId = req.user._id;
    if (!content || !userId) {
        throw new ApiError(400, "Content and user ID are required");
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const tweet = await Tweet.create({ content, owner: userId });
    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet");
    }

    return res
        .status(201)
        .json(new ApiResponce(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const tweets = await User.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "tweets",
            },
        },
    ]);
    if(tweets.length === 0) {
        throw new ApiError(404, "No tweets found for this user");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, tweets, "User tweets retrieved successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const tweetId = req.params.tweetId;
    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content },
        { new: true }
    );
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const tweet = await Tweet.findByIdAndDelete(tweetId);

    return res
        .status(200)
        .json(new ApiResponce(200, null, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
