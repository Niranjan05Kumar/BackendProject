import { Router } from "express";
const router = Router();

import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.use(verifyJWT);

router.route("/").get((req, res) => {
    return res.status(200).json({ message: "Playlist API is working" });
});

router.route("/create").post(createPlaylist);

router.route("/add-video").post(addVideoToPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

router.route("/:playlistId").get(getPlaylistById);

router.route("/remove-video").post(removeVideoFromPlaylist);

router.route("/:playlistId").delete(deletePlaylist);

router.route("/update/:playlistId").put(updatePlaylist);

export default router;
