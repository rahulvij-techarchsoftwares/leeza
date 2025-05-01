const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true
  },
  subCategories: {
    type: [mongoose.Schema.Types.ObjectId], 
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
