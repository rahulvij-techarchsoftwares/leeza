const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPost',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: { 
    type: String,
  },
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'hired'],
    default: 'applied'
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
