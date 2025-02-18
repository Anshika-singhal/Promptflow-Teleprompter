const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    filepath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Video", VideoSchema);
