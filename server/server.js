
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Task = require("./models/Task");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("The Sunday Edit backend is running!");
});

// Get all tasks for a date
app.get("/api/tasks", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    const tasks = await Task.find({ date }).sort({
      createdAt: -1,
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, date, dueTime, priority, isTopThree } = req.body;

    if (!title || !title.trim() || !date) {
      return res.status(400).json({
        message: "Task title and date are required.",
      });
    }

    const task = await Task.create({
      title,
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

// Edit or complete a task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
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

