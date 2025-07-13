import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const varifyJWT = asyncHandler(async (req, _ , next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization").replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Invalid Access Token");
        }

        const decodedToken = jwt.varify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(400, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(400, "Invalid Access Token");
    }
});
