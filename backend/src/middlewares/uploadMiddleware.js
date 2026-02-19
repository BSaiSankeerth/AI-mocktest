const multer = require("multer");

// Use memory storage (NOT disk)
const storage = multer.memoryStorage();

// File filter (PDF or TXT only)
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "application/pdf" ||
        file.mimetype === "text/plain"
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF or TXT files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
