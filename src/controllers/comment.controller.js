import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const addComment = asyncHandler(async (req, res) => {
    try {
        const { content } = req.body;
        const { videoId } = req.params;
        const userId = req.user._id;
        const comment = await Comment.create({
            content,
            video: videoId,
            owner: userId,
        });
        if (!comment) {
            throw new ApiError(400, "Comment not created");
        }
        return res
            .status(201)
            .json(new ApiResponce(201, comment, "Comment added successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, error.message));
    }
});

const getVideoComments = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;

        const comments = await Video.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId),
                },
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "video",
                    as: "comments",
                },
            },
            { $unwind: "$comments" },
            {
                $lookup: {
                    from: "users",
                    localField: "comments.owner",
                    foreignField: "_id",
                    as: "owner",
                },
            },
            { $unwind: "$owner" },
            {
                $project: {
                    _id: "$comments._id",
                    content: "$comments.content",
                    createdAt: "$comments.createdAt",
                    updatedAt: "$comments.updatedAt",
                    owner: "$owner",
                },
            },
        ]);
        if (!comments) {
            throw new ApiError(404, "Comments not found for the video");
        }
        return res
            .status(200)
            .json(
                new ApiResponce(200, comments, "Comments fetched successfully")
            );
    } catch (error) {
        console.error("Error fetching comments:", error.message);
        res.status(500).json(new ApiError(500, error.message));
    }
});

const updateComment = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const comment = await Comment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true }
        );
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }
        return res
            .status(200)
            .json(
                new ApiResponce(200, comment, "Comment updated successfully")
            );
    } catch (error) {
        res.status(500).json(new ApiError(500, error.message));
    }
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params;
    const comment = await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Comment deleted successfully"));
});

export { addComment, getVideoComments, updateComment, deleteComment };
