const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        const { gender, category, subcategory } = req.body;

        return {
            folder: `wedswardrobe/${gender}/${category}/${subcategory}`,
            allowed_formats: ["jpg", "png", "jpeg"],
        };
    },
});

const upload = multer({ storage });

module.exports = upload;