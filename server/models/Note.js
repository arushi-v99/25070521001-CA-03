
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "Personal",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
