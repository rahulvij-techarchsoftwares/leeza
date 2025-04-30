const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  experience: {
    type: String
  },
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

const companyProfileSchema = new mongoose.Schema({
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String
    },
    website: [
      {
        type: String
      }
    ],
    about: {
      type: String
    },
    noOfEmployees: {
      type: String
    },
    supportEmail: {
      type: String
    },
    supportPhoneNumber: {
      type: String
    },
    industry: [
      {
        type: String
      }
    ],
    projects: [
      {
        type: String
      }
    ],
    clients: [
      {
        type: String
      }
    ],
    yearEstablished: {
      type: Date
    }
  }, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
