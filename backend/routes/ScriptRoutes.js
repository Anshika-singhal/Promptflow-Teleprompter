const express = require("express");
const Script = require("../models/Script");
const router = express.Router();

// ▶ Create a new Script
router.post("/script", async (req, res) => {
    try {
        const { title, content } = req.body;
        const newScript = new Script({ title, content });
        await newScript.save();
        res.status(201).json({ message: "Script saved!", script: newScript });
    } catch (err) {
        res.status(500).json({ error: "Error saving script", error: err.message });
    }
});

// ▶ Get all Scripts
router.get("/script", async (req, res) => {
    try {
        const scripts = await Script.find();
        res.status(200).json(scripts);
    } catch (err) {
        res.status(500).json({ error: "Error fetching scripts", error: err.message });
    }
});

// ▶ Update a Script by ID
router.put("/script/:id", async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        const updatedScript = await Script.findByIdAndUpdate(
            id, 
            { title, content },
            { new: true, runValidators: true }
        );

        if (!updatedScript) {
            return res.status(404).json({ message: "Script not found" });
        }

        res.status(200).json({ message: "Script updated!", script: updatedScript });
    } catch (err) {
        res.status(500).json({ error: "Error updating script", error: err.message });
    }
});

// ▶ Delete a script by ID
router.delete("/script/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deletedScript = await Script.findByIdAndDelete(id);
        if (!deletedScript) {
            return res.status(404).json({ message: "Script not found" });
        }
        res.status(200).json({ message: "Script deleted!", data: deletedScript });
    } catch (err) {
        res.status(500).json({ error: "Error deleting script", error: err.message });
    }
});

module.exports = router;
