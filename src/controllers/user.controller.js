import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/apiResponce.js";
import jwt from "jsonwebtoken";

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
        .json(new ApiResponce(200, user, "User details updated successfully"));
});

export {
    userRegister,
    userLogin,
    userLogout,
    refreshingAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
};
