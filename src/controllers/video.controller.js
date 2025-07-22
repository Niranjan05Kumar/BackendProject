import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find().sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponce(200, videos, "videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user._id;
        const videoFileLocalPath = req.files?.videoFile[0]?.path;
        const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

        if (!videoFileLocalPath) {
            throw new ApiError(400, "Video file is required.");
        }

        const videoFile = await uploadOnCloudinary(videoFileLocalPath);
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!videoFile) {
            throw new ApiError(500, "Failed to upload video file.");
        }

        const video = await Video.create({
            videoFile: videoFile.secure_url,
            thumbnail: thumbnail?.secure_url || null,
            title,
            description,
            duration: videoFile.duration,
            owner: userId,
        });

        return res
            .status(201)
            .json(
                new ApiResponce(201, { video }, "Video published successfully")
            );
    } catch (error) {
        console.error("your error:", error.message);
        res.status(500).json(new ApiError(500, error.message));
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video ID.");
        }
        const video = await Video.findById(videoId).populate("owner");

        return res
            .status(200)
            .json(new ApiResponce(200, video, "Video fetched successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, error.message));
    }
});

const updateVideo = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { description, title } = req.body;
        const thumbnailLocalPath = req.file?.path;

        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video ID.");
        }

        if (!thumbnailLocalPath) {
            throw new ApiError(400, "Thumbnail is required.");
        }

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail) {
            throw new ApiError(500, "Failed to upload thumbnail.");
        }

        const video = await Video.findByIdAndUpdate(
            videoId,
            {
                title,
                description,
                thumbnail: thumbnail.secure_url,
            },
            { new: true }
        );
        if (!video) {
            throw new ApiError(404, "Video not found.");
        }
        return res
            .status(200)
            .json(new ApiResponce(200, video, "Video updated successfully"));
    } catch (error) {
        res.status(500).json(new ApiError(500, error.message));
    }
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID.");
    }
    await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID.");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found.");
    }
    video.isPublished = !video.isPublished;
    await video.save();
    return res
        .status(200)
        .json(new ApiResponce(200, video, "Video publish status toggled"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
