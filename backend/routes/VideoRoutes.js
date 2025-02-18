const express = require("express");
const fs = require("fs");
const path = require("path");
const { upload } = require("../uploadConfig"); // ✅ Import updated upload config
const Video = require("../models/Video"); // ✅ Import Video Model
const router = express.Router();

// ▶ Upload Video
router.post("/upload", upload.single("video"), async (req, res) => {
    console.log("Received file:", req.file); // ✅ Debugging line
    if (!req.file) {
        return res.status(400).json({ error: "No video file uploaded" });
    }

    // ✅ Save only the file path in MongoDB
    const newVideo = new Video({
        filename: req.file.filename,
        filepath: req.file.path, // 📌 Save file location
    });

    await newVideo.save();
    res.status(201).json({ message: "Video uploaded successfully!", video: newVideo });
});

// ▶ Stream Video (Serve from Local Storage)
router.get("/:filename", (req, res) => {
    const filePath = path.join(__dirname, "../uploads", req.params.filename);

    // ✅ Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Video not found" });
    }

    // ✅ Serve video file
    res.sendFile(filePath);
});

module.exports = router;
