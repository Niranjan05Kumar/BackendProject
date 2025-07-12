const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/temp");
    },
    filename: (req, file, cb) => {
        const filename =
            crypto.randomBytes(12).toString("hex") +
            path.extname(file.originalname);
        cb(null, filename);
    },
});

const upload = multer({ storage: storage });
