import express from "express";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";
import tweetRouter from "./routes/tweet.route.js";
import commentRouter from "./routes/comment.route.js";
import likeRouter from "./routes/like.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import playlistRouter from "./routes/playlist.route.js";


app.use("/api/v0/users", userRouter);
app.use("/api/v0/videos", videoRouter);
app.use("/api/v0/tweets", tweetRouter);
app.use("/api/v0/comments", commentRouter);
app.use("/api/v0/likes", likeRouter);
app.use("/api/v0/subscriptions", subscriptionRouter);
app.use("/api/v0/playlists", playlistRouter);

export { app };
