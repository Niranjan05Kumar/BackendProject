import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination

    return res
        .status(200)
        .json(new ApiResponce(200, {}, "Videos fetched successfully"));
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
            owner: userId
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
    const { videoId } = req.params;
    //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
