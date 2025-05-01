const Application = require('../models/applicationModel');
const JobPost = require("../models/jobsModel");
const Profile = require("../models/profileModel"); 
const Role = require("../models/roleModel");
const User = require("../models/userModel");
const CompanyProfile = require('../models/companyprofileModel');
const mongoose = require('mongoose');

exports.addApplication = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { job_id, coverLetter } = req.body;
    if (!mongoose.Types.ObjectId.isValid(job_id)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }
    const job = await JobPost.findById(job_id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    const existingApplication = await Application.findOne({ job_id, user_id: userId });
    if (existingApplication) {
      return res.status(409).json({ message: "You have already applied to this job" });
    }
    const newApplication = new Application({
      job_id,
      user_id: userId,
      coverLetter 
    });
    await newApplication.save();
    res.status(201).json({
      message: "Application submitted successfully",
      application: newApplication
    });

  } catch (error) {
    console.error("Error applying to job:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getUserApplicationsDetailed = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await Application.find({ user_id: userId });
    const detailedApplications = [];
    for (const app of applications) {
      const job = await JobPost.findById(app.job_id).lean();
      if (!job) continue;
      const company = await CompanyProfile.findOne({ company_id: job.company_id }).lean();
      const allRoles = await Role.find({});
      const matchedSubcategories = [];

      for (const subCatId of job.category) {
        allRoles.forEach(role => {
          const matchedSub = role.subCategories.find(sub => sub._id.toString() === subCatId.toString());
          if (matchedSub) {
            matchedSubcategories.push({
              roleName: role.roleName,
              subCategory: matchedSub
            });
          }
        });
      }

      detailedApplications.push({
        applicationId: app._id,
        status: app.status,
        appliedAt: app.createdAt,
        jobDetails: {
          ...job,
          subCategoriesDetailed: matchedSubcategories
        },
        companyDetails: company || null
      });
    }

    res.status(200).json({
      message: 'Applications fetched successfully',
      applications: detailedApplications
    });

  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getJobApplicationsForCompany = async (req, res) => {
  try {
    const companyId = req.user.id; 
    const { job_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(job_id)) {
      return res.status(400).json({ message: "Invalid job ID" });
    }

    const job = await JobPost.findById(job_id).lean();

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.company_id.toString() !== companyId.toString()) {
      return res.status(403).json({ message: "Unauthorized to view applications for this job" });
    }

    const applications = await Application.find({ job_id }).lean();

    const detailedApplications = [];

    for (const app of applications) {
      const userProfile = await Profile.findOne({ user_id: app.user_id }).lean();

      detailedApplications.push({
        applicationId: app._id,
        status: app.status,
        coverLetter: app.coverLetter || null,
        appliedAt: app.createdAt,
        userDetails: userProfile || null
      });
    }

    res.status(200).json({
      message: "Applications fetched successfully",
      jobDetails: job,
      applications: detailedApplications
    });

  } catch (error) {
    console.error("Error fetching job applications for company:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getUserSingleApplicationDetailed = async (req, res) => {
  try {
    const userId = req.user.id;
    const { application_id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(application_id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    const app = await Application.findById(application_id);
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (app.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized access to this application" });
    }

    const job = await JobPost.findById(app.job_id).lean();
    if (!job) {
      return res.status(404).json({ message: "Job post not found" });
    }

    const company = await CompanyProfile.findOne({ company_id: job.company_id }).lean();
    const allRoles = await Role.find({});
    const matchedSubcategories = [];

    for (const subCatId of job.category) {
      allRoles.forEach(role => {
        const matchedSub = role.subCategories.find(sub => sub._id.toString() === subCatId.toString());
        if (matchedSub) {
          matchedSubcategories.push({
            roleName: role.roleName,
            subCategory: matchedSub
          });
        }
      });
    }

    const detailedApplication = {
      applicationId: app._id,
      status: app.status,
      appliedAt: app.createdAt,
      jobDetails: {
        ...job,
        subCategoriesDetailed: matchedSubcategories
      },
      companyDetails: company || null
    };

    res.status(200).json({
      message: 'Application fetched successfully',
      application: detailedApplication
    });

  } catch (error) {
    console.error("Error fetching single application:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { application_id } = req.params; 
    const { status } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const role = await Role.findById(user.role);
    if (!role) return res.status(404).json({ message: 'Role not found.' });
    if (role.roleName !== 'Company') {
      return res.status(403).json({ message: 'Only company users can update application status.' });
    }
    const application = await Application.findById(application_id);
    if (!application) return res.status(404).json({ message: 'Application not found.' });

    application.status = status;
    await application.save();

    res.status(200).json({
      message: 'Application status updated successfully.',
      application
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};