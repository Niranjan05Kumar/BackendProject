import { asyncHandler } from "../utils/asyncHandler.js";

const userRegistor = asyncHandler((req, res, next) => {
    res.status(200).json({
        message: "All done, userRegistor route is running",
    });
});

export { userRegistor };
