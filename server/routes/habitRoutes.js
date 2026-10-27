
const express = require("express");
const router = express.Router();
const Habit = require("../models/Habit");

router.get("/", async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, frequency, completedDates } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Habit name is required." });
    }

    const habit = await Habit.create({
      name,
      description,
      frequency,
      completedDates,
    });

    res.status(201).json(habit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const habit = await Habit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ message: "Habit not found." });
    }

    res.json(habit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found." });
    }

    res.json({ message: "Habit deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
