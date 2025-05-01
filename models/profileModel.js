const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  username: {
    type: String,
    unique: true
  },
  experience: [
    {
      companyName: String,
      position: String,
      startDate: Date,
      endDate: Date
    }
  ],
  portfolioLinks: [
    {
      type: String
    }
  ],
  skills: [
    {
      type: String
    }
  ],
  education: [
    {
      instituteName: { type: String },
      degreeName: { type: String },
      fieldOfStudy: { type: String },
      startDate: { type: Date },
      endDate: { type: Date }, 
      location: { type: String }
    }
  ],
  certifications: [
    {
      type: String
    }
  ],
  socialLinks: [
    {
      type: String
    }
  ],
  location: {
    type: String
  },
  availability: {
    type: String 
  },
  hourlyRate: {
    type: String 
  }
}, { timestamps: true });



module.exports = mongoose.model('Profile', profileSchema);

