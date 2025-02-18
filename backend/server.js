require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const videoRoutes = require("./routes/VideoRoutes");
const scriptRoutes = require("./routes/ScriptRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve uploaded videos statically
app.use("/uploads", express.static("uploads"));

app.use("/api/videos", videoRoutes);
app.use("/api",scriptRoutes);

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.Mongo_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error: ", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
