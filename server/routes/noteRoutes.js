
const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Note title is required." });
    }

    const note = await Note.create({ title, content, category });
    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    res.json({ message: "Note deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
