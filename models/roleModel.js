const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  subCategories: {
    type: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          auto: true, 
        },
        name: {
          type: String,
          required: true,
          trim: true,
        }
      }
    ],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model("Role", roleSchema);
