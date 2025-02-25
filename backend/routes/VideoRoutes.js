const express = require("express");
const fs = require("fs");
const path = require("path");
const { upload } = require("../uploadConfig");
const Video = require("../models/Video");
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ▶ Upload Video (Improved)
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path); // Remove invalid file
      return res.status(400).json({ error: "Invalid video format" });
    }

    const newVideo = new Video({
      filename: req.file.filename,
      filepath: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    await newVideo.save();
    res.status(201).json({
      message: "Video uploaded successfully!",
      video: {
        id: newVideo._id,
        filename: newVideo.filename,
        url: `/api/videos/${newVideo.filename}`
      }
    });
  } catch (error) {
    console.error("Upload Error:", error);
    if (req.file) fs.unlinkSync(req.file.path); // Cleanup on error
    res.status(500).json({ error: "Server error during upload" });
  }
});

// ▶ Stream Video (Enhanced with Range Support)
router.get("/:filename", async (req, res) => {
  try {
    const video = await Video.findOne({ filename: req.params.filename });
    if (!video) return res.status(404).json({ error: "Video not found" });

    const filePath = path.join(uploadsDir, video.filename);
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range requests
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": video.mimetype
      });
      
      file.pipe(res);
    } else {
      // Full file response
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": video.mimetype
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error("Stream Error:", error);
    res.status(500).json({ error: "Server error during streaming" });
  }
});

module.exports = router;