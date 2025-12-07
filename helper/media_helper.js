const { unlink } = require("fs/promises");
const multer = require("multer");
const path = require("path");

const ALLOWED_EXTENSIONS = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
};

const storage = multer.diskStorage({
    destination: function (_, _, cb) {
        cb(null, "./public/uploads/");
    },
    filename: function (_, file, cb) {
        const filename = file.originalname
            .split(" ").join("-")
            .replace(".png", "")
            .replace(".jpg", "")
            .replace(".jpeg", "");
        const extension = ALLOWED_EXTENSIONS[file.mimetype];
        cb(null, filename + Date.now() + "." + extension);
    },
});

exports.upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5, //5mb
    },
    fileFilter(_, file, cb) {
        const isValid = ALLOWED_EXTENSIONS[file.mimetype];
        let uploadError = new Error(`Invalid image type\n${file.mimetype} is not allowed`);

        if (!isValid) return cb(uploadError);
        cb(null, true);
    },
});

exports.deleteImages = async function (imageUrls, continueOnError) {
    await Promise.all(
        imageUrls.map(async (Imageurl) => {
            const imagePath = path.resolve(
                __dirname,
                "..",
                "public",
                "uploads",
                path.basename(Imageurl),
            );
            try {
                await unlink(imagePath);
            } catch (error) {
                if (error.code === continueOnError) {
                    console.error(`continue with next image : ${error.message}`);
                } else {
                    console.error(`Error deleting image: ${error.message} `);
                }
            }
        })
    );
};