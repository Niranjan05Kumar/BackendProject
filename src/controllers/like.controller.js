import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }
    const like = await Like.findOne({
        likedBy: userId,
        video: videoId,
    });
    if (like) {
        await Like.findByIdAndDelete(like._id);
        return res
            .status(200)
            .json(new ApiResponce(200, null, "Like removed successfully"));
    }

    const newLike = await Like.create({
        likedBy: userId,
        video: videoId,
    });
    if (!newLike) {
        throw new ApiError(500, "Failed to add like");
    }

    return res
        .status(200)
        .json(new ApiResponce(200, null, "Like added successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }
    const userId = req.user._id;
    const like = await Like.findOne({
        likedBy: userId,
        comment: commentId,
    });
    if (like) {
        await Like.findByIdAndDelete(like._id);
        return res
            .status(200)
            .json(new ApiResponce(200, null, "Like removed successfully"));
    }
    const newLike = await Like.create({
        likedBy: userId,
        comment: commentId,
    });
    if (!newLike) {
        throw new ApiError(500, "Failed to add like");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, null, "Like added successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }
    const userId = req.user._id;
    const like = await Like.findOne({
        likedBy: userId,
        tweet: tweetId,
    });
    if (like) {
        await Like.findByIdAndDelete(like._id);
        return res
            .status(200)
            .json(new ApiResponce(200, null, "Like removed successfully"));
    }
    const newLike = await Like.create({
        likedBy: userId,
        tweet: tweetId,
    });
    if (!newLike) {
        throw new ApiError(500, "Failed to add like");
    }
    return res
        .status(200)
        .json(new ApiResponce(200, null, "Like added successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }
    const likedVideos = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "likedBy",
                as: "likes",
            },
        },
        { $unwind: "$likes" },
        {
            $lookup: {
                from: "videos",
                localField: "likes.video",
                foreignField: "_id",
                as: "videoDetails",
            },
        },
        { $unwind: "$videoDetails" },
        {
            $project: {
                _id: 0,
                video: "$videoDetails",
            },
        },
        { $sort: { "videoDetails.createdAt": -1 } },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                likedVideos,
                "Liked videos fetched successfully"
            )
        );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
