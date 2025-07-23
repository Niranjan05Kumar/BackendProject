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

// routes import
import userRouter from "./routes/user.route.js";
import videoRouter from "./routes/video.route.js";
import tweetRouter from "./routes/tweet.route.js";


// routes declaration
app.use("/api/v0/users", userRouter);
app.use("/api/v0/videos", videoRouter);
app.use("/api/v0/tweets", tweetRouter);

export { app };
