const pdfParse = require("pdf-parse");
const crypto = require("crypto");

const extractText = async (file) => {
    if (file.mimetype === "application/pdf") {
        const data = await pdfParse(file.buffer);
        return data.text;
    } else {
        return file.buffer.toString("utf-8");
    }
};

const generateHash = (text) => {
    return crypto
        .createHash("sha256")
        .update(text)
        .digest("hex");
};

module.exports = { extractText, generateHash };
