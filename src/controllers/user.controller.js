import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/apiResponce.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const userRegister = asyncHandler(async (req, res, next) => {
    const { username, email, fullname, password } = req.body;

    if (
        [username, email, fullname, password].some(
            (field) => !field || field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(400, "Username or email already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed");
    }

    const user = await User.create({
        username,
        email,
        fullname,
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || "",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    return res
        .status(201)
        .json(
            new ApiResponce(201, createdUser, "User registered successfully!")
        );
});

const userLogin = asyncHandler(async (req, res, next) => {
    const { username, password, email } = req.body;

    if (!email && !username) {
        throw new ApiError(400, "Email or username is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid user credentials");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const userData = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponce(
                200,
                { user: userData, accessToken, refreshToken },
                "User logged in successfully!"
            )
        );
});

const userLogout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            refreshToken: undefined,
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(new ApiResponce(200, {}, "User logged out"));
});

const refreshingAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies?.refreshToken || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(400, "Invalid RefreshToken");
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        if (!decodedToken) {
            throw new ApiError(400, "Invalid RefreshToken");
        }

        const user = await User.findById(decodedToken._id);
        if (!user) {
            throw new ApiError(400, "user not found");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(400, "RefreshToken not match");
        }

        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        user.refreshToken = newRefreshToken;
        await user.save();

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("refreshToken", newRefreshToken, options)
            .cookie("accessToken", newAccessToken, options)
            .json(
                new ApiResponce(
                    200,
                    {
                        accessToken: newAccessToken,
                        refreshToken: newRefreshToken,
                    },
                    "AccessToken refreshed successfully!"
                )
            );
    } catch (error) {
        console.log("your error: ", error.message);
        throw new ApiError(400, "Invalid RefreshToken");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            throw new ApiError(400, "Both passwords are required");
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ApiError(400, "User not loggedIn");
        }

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Old password is incorrect");
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .json(new ApiResponce(200, {}, "Password changed successfully"));
    } catch (error) {
        console.log("your error: ", error.message);
        throw new ApiError(400, "Something went wrong");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id).select("-password");
    return res
        .status(200)
        .json(new ApiResponce(200, user, "User get successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    try {
        const { username, fullname } = req.body;

        if (!username || !fullname) {
            throw new ApiError(400, "All fields are required");
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    username,
                    fullname,
                },
            },
            { new: true }
        );

        return res
            .status(200)
            .json(
                new ApiResponce(200, user, "User details updated successfully")
            );
    } catch (error) {
        throw new ApiError(400, "Account detail update failed");
    }
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    try {
        const avatarLocalPath = req.file?.path;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required");
        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: { avatar: avatar.secure_url },
            },
            { new: true }
        );

        return res
            .status(200)
            .json(new ApiResponce(200, user, "Avatar updated successfully"));
    } catch (error) {
        throw new ApiError(500, "avatar update failed");
    }
});

const updateUsercoverImage = asyncHandler(async (req, res) => {
    try {
        const coverImageLocalPath = req.file?.path;

        if (!coverImageLocalPath) {
            throw new ApiError(400, "Cover image file is required");
        }

        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: { coverImage: coverImage.secure_url },
            },
            { new: true }
        );

        return res
            .status(200)
            .json(
                new ApiResponce(200, user, "Cover mage updated successfully")
            );
    } catch (error) {
        throw new ApiError(500, "Cover image update failed");
    }
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "user not exist");
    }

    try {
        const channel = await User.aggregate([
            {
                $match: {
                    username: username,
                },
            },
            {
                $lookup: {
                    from: "subscriptions", // Subscription ka mongodb me subscriptions name se model save hoga
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribed",
                },
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers",
                    },
                    subscribedCount: {
                        $size: "$subscribed",
                    },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"],
                            },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            {
                $project: {
                    username: 1,
                    fullname: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscribersCount: 1,
                    subscribedCount: 1,
                    isSubscribed: 1,
                },
            },
        ]);

        if (!channel?.length) {
            throw new ApiError(404, "Channel not found");
        }

        return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    channel[0],
                    "Channel profile fetched successfully"
                )
            );
    } catch (error) {
        console.error("Error fetching channel profile:", error.message);
        throw new ApiError(500, "Failed to fetch channel profile");
    }
});

const getWatchHistory = asyncHandler(async (req, res) => {
    try {
        const user = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user._id),
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            username: 1,
                                            fullname: 1,
                                            avatar: 1,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner",
                                },
                            },
                        },
                    ],
                },
            },
        ]);

        if (!user?.length) {
            throw new ApiError(404, "User not found");
        }

        return res
            .status(200)
            .json(
                new ApiResponce(
                    200,
                    user[0].watchHistory,
                    "Watch history fetched successfully"
                )
            );
    } catch (error) {
        console.error("Error fetching watch history:", error.message);
        throw new ApiError(500, "Failed to fetch watch history");
    }
});

export {
    userRegister,
    userLogin,
    userLogout,
    refreshingAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage,
    getUserChannelProfile,
    getWatchHistory,
};
