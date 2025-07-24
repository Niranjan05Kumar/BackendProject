import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user._id;
    if (!title) {
        throw new ApiError(400, "Playlist title is required.");
    }
    const playlist = await Playlist.create({
        title,
        description,
        owner: userId,
    });
    return res
        .status(201)
        .json(
            new ApiResponce(201, { playlist }, "Playlist created successfully")
        );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID.");
    }
    const playlists = await Playlist.find({ owner: userId }).populate(
        "videos",
        "title thumbnail duration"
    );

    if (!playlists || playlists.length === 0) {
        return res
            .status(404)
            .json(
                new ApiResponce(404, null, "No playlists found for this user.")
            );
    }

    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                playlists,
                "User playlists retrieved successfully"
            )
        );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID.");
    }
    const playlist = await Playlist.findById(playlistId).populate(
        "videos",
        "title thumbnail duration"
    );
    if (!playlist) {
        throw new ApiError(404, "Playlist not found.");
    }
    return res
        .status(200)
        .json(
            new ApiResponce(200, playlist, "Playlist retrieved successfully")
        );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId, videoId } = req.query;

        if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid playlist or videoId ID.");
        }

        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            throw new ApiError(404, "Playlist not found.");
        }
        if (playlist.videos.includes(videoId)) {
            throw new ApiError(400, "Video already exists in the playlist.");
        }

        playlist.videos.push(videoId);
        await playlist.save();

        return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    playlist,
                    "Video added to playlist successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, error.message);
    }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.query;
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID.");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found.");
    }
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not found in the playlist.");
    }
    playlist.videos = playlist.videos.filter((id) => id.toString() !== videoId);
    await playlist.save();
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                playlist,
                "Video removed from playlist successfully"
            )
        );
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID.");
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json(new ApiResponce(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { title, description } = req.body;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID.");
    }
    if (!title) {
        throw new ApiError(400, "Playlist title is required.");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { title, description },
        { new: true }
    );
    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found.");
    }
    return res
        .status(200)
        .json(
            new ApiResponce(
                200,
                updatedPlaylist,
                "Playlist updated successfully"
            )
        );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
};
