const mongoose = require('mongoose');
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

  module.exports = mongoose.model('CompanyProfile', companyProfileSchema);