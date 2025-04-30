const mongoose = require('mongoose');

const jobPostSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role'
    }
  ],
  budget: {
    type: String
  },
  location: {
    type: String
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['opened', 'closed'],
    default: 'opened'
  }
}, { timestamps: true });


jobPostSchema.pre('save', function (next) {
  const currentDate = new Date();
  this.status = this.deadline < currentDate ? 'closed' : 'opened';
  next();
});

jobPostSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  const currentDate = new Date();

  if (update.deadline) {
    update.status = update.deadline < currentDate ? 'closed' : 'opened';
  }

  next();
});

module.exports = mongoose.model('JobPost', jobPostSchema);
