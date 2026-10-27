
const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");

// Get all goals
router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a goal
router.post("/", async (req, res) => {
  try {
    const { title, description, targetDate, progress, completed } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Goal title is required." });
    }

    const goal = await Goal.create({
      title,
      description,
      targetDate,
      progress,
      completed,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Edit a goal
router.put("/:id", async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a goal
router.delete("/:id", async (req, res) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    res.json({ message: "Goal deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
