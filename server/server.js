
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Task = require("./models/Task");
const goalRoutes = require("./routes/goalRoutes");
const noteRoutes = require("./routes/noteRoutes");
const habitRoutes = require("./routes/habitRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/goals", goalRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("The Daily Edit backend is running!");
});

app.get("/api/auth/test", (req, res) => {
  res.json({ message: "Auth routes are reachable!" });
});

// Get tasks for a date belonging to the logged-in user
app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date is required.",
      });
    }

    const tasks = await Task.find({
      date,
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a task for the logged-in user
app.post("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const { title, date, dueTime, priority, isTopThree } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof date !== "string" ||
      !date.trim()
    ) {
      return res.status(400).json({
        message: "Task title and date are required.",
      });
    }

    const task = await Task.create({
      user: req.user.id,
      title: title.trim(),
      date,
      dueTime,
      priority,
      isTopThree,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Edit or complete a task belonging to the logged-in user
app.put("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "date",
      "dueTime",
      "priority",
      "completed",
      "isTopThree",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.title !== undefined) {
      if (
        typeof updates.title !== "string" ||
        !updates.title.trim()
      ) {
        return res.status(400).json({
          message: "Task title cannot be empty.",
        });
      }

      updates.title = updates.title.trim();
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a task belonging to the logged-in user
app.delete("/api/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
