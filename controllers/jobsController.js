const JobPost = require("../models/jobsModel");
const Role = require("../models/roleModel");
const CompanyProfile = require('../models/companyprofileModel');
const User = require("../models/userModel");
const mongoose = require("mongoose");

exports.addJobPost = async (req, res) => {
  try {
    const {
      jobTitle,
      jobDescription,
      category,
      budget,
      location,
      deadline
    } = req.body;

    const companyId = req.user.id; 

    const allRoles = await Role.find({});
    const allSubCategoryIds = allRoles.flatMap(role =>
      role.subCategories.map(sc => sc._id.toString())
    );

    const isValidCategories = category.every(catId =>
      allSubCategoryIds.includes(catId)
    );

    if (!isValidCategories) {
      return res.status(400).json({ message: "Invalid category/subCategory ID(s) provided." });
    }

    const newJobPost = new JobPost({
      company_id: new mongoose.Types.ObjectId(companyId),
      jobTitle,
      jobDescription,
      category: category.map(id => new mongoose.Types.ObjectId(id)),
      budget,
      location, 
      deadline
    });

    await newJobPost.save();

    res.status(201).json({
      message: "Job post created successfully",
      job: newJobPost
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await JobPost.find();

    if (!jobs.length) {
      return res.status(404).json({ message: 'No job posts found.' });
    }

    const allRoles = await Role.find({}, { roleName: 1, subCategories: 1 });

    const jobDetails = await Promise.all(
      jobs.map(async (job) => {
        const company = await CompanyProfile.findOne({ company_id: job.company_id });

        const matchedSubCategories = [];
        for (const subCatId of job.category) {
          for (const role of allRoles) {
            const matchedSubCat = role.subCategories.find(
              (sub) => sub._id.toString() === subCatId.toString()
            );
            if (matchedSubCat) {
              matchedSubCategories.push({
                _id: matchedSubCat._id,
                name: matchedSubCat.name,
                roleName: role.roleName
              });
              break;
            }
          }
        }

        return {
          _id: job._id,
          jobTitle: job.jobTitle,
          jobDescription: job.jobDescription,
          budget: job.budget,
          location: job.location,
          deadline: job.deadline,
          status: job.status,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          company: company ? {
            name: company.name,
            website: company.website,
            about: company.about,
            noOfEmployees: company.noOfEmployees,
            supportEmail: company.supportEmail,
            supportPhoneNumber: company.supportPhoneNumber,
            industry: company.industry,
            projects: company.projects,
            clients: company.clients,
            yearEstablished: company.yearEstablished
          } : null,
          subCategories: matchedSubCategories
        };
      })
    );

    res.status(200).json({
      message: "Job posts retrieved successfully",
      jobs: jobDetails
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


exports.getUserMatchingJobs = async (req, res) => {
  try {
    const userId = req.user.id; 

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const userSubCategoryIds = user.subCategories.map(id => id.toString());

    const allRoles = await Role.find({}, { roleName: 1, subCategories: 1 });
    const userSubCategories = [];
    for (const subId of userSubCategoryIds) {
      for (const role of allRoles) {
        const matched = role.subCategories.find(sub => sub._id.toString() === subId);
        if (matched) {
          userSubCategories.push({
            _id: matched._id,
            name: matched.name,
            roleName: role.roleName
          });
          break;
        }
      }
    }
    const matchingJobs = await JobPost.find({
      category: { $in: user.subCategories }
    });

    const jobResults = [];

    for (const job of matchingJobs) {
      const matchedSubCategories = [];

      for (const catId of job.category) {
        for (const role of allRoles) {
          const matched = role.subCategories.find(sub => sub._id.toString() === catId.toString());
          if (matched) {
            matchedSubCategories.push({
              _id: matched._id,
              name: matched.name,
              roleName: role.roleName
            });
            break;
          }
        }
      }
      const companyProfile = await CompanyProfile.findOne({ company_id: job.company_id });

      jobResults.push({
        _id: job._id,
        jobTitle: job.jobTitle,
        jobDescription: job.jobDescription,
        budget: job.budget,
        location: job.location,
        deadline: job.deadline,
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        subCategories: matchedSubCategories,
        company: companyProfile
          ? {
              name: companyProfile.name,
              website: companyProfile.website,
              about: companyProfile.about,
              noOfEmployees: companyProfile.noOfEmployees,
              supportEmail: companyProfile.supportEmail,
              supportPhoneNumber: companyProfile.supportPhoneNumber,
              industry: companyProfile.industry,
              projects: companyProfile.projects,
              clients: companyProfile.clients,
              yearEstablished: companyProfile.yearEstablished
            }
          : null
      });
    }

    res.status(200).json({
      message: "User matched jobs with company details retrieved successfully",
      user: {
        _id: user._id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        subCategories: userSubCategories
      },
      jobs: jobResults
    });
  } catch (error) {
    console.error('Error in getUserMatchingJobs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getparticularCompanyJobsWithDetails = async (req, res) => {
  try {
    const companyId = req.user.id; 

    const companyProfile = await CompanyProfile.findOne({ company_id: companyId });

    if (!companyProfile) {
      return res.status(404).json({ message: 'Company profile not found' });
    }

    const roles = await Role.find();

    const jobPosts = await JobPost.find({ company_id: companyId });

    const jobsWithSubCategories = jobPosts.map(job => {
      const matchedSubCategories = [];

      for (const catId of job.category) {
        for (const role of roles) {
          const matched = role.subCategories.find(sub => sub._id.toString() === catId.toString());
          if (matched) {
            matchedSubCategories.push({
              _id: matched._id,
              name: matched.name,
              roleName: role.roleName
            });
            break;
          }
        }
      }

      return {
        _id: job._id,
        jobTitle: job.jobTitle,
        jobDescription: job.jobDescription,
        budget: job.budget,
        location: job.location,
        deadline: job.deadline,
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        subCategories: matchedSubCategories
      };
    });

    res.status(200).json({
      message: 'Company jobs with details retrieved successfully',
      company: {
        name: companyProfile.name,
        website: companyProfile.website,
        about: companyProfile.about,
        noOfEmployees: companyProfile.noOfEmployees,
        supportEmail: companyProfile.supportEmail,
        supportPhoneNumber: companyProfile.supportPhoneNumber,
        industry: companyProfile.industry,
        projects: companyProfile.projects,
        clients: companyProfile.clients,
        yearEstablished: companyProfile.yearEstablished
      },
      jobs: jobsWithSubCategories
    });
  } catch (error) {
    console.error('Error in getCompanyJobsWithDetails:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.deleteJobPostByCompany = async (req, res) => {
  try {
    const companyIdFromToken = req.user.id; 
    const jobId = req.params.jobId;

    const job = await JobPost.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job post not found" });
    }
    if (job.company_id.toString() !== companyIdFromToken.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this job post" });
    }

    await JobPost.findByIdAndDelete(jobId);

    res.status(200).json({ message: "Job post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.editJobPost = async (req, res) => {
  try {
    const { jobTitle, jobDescription, category, budget, location, deadline } = req.body;
    const jobId = req.params.jobId; 
    const companyId = req.user.id; 
    const jobPost = await JobPost.findById(jobId);

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }
    if (jobPost.company_id.toString() !== companyId.toString()) {
      return res.status(403).json({ message: "Unauthorized to edit this job post" });
    }
    const allRoles = await Role.find({});
    const allSubCategoryIds = allRoles.flatMap(role =>
      role.subCategories.map(sc => sc._id.toString())
    );

    const isValidCategories = category.every(catId =>
      allSubCategoryIds.includes(catId)
    );

    if (!isValidCategories) {
      return res.status(400).json({ message: "Invalid category/subCategory ID(s) provided." });
    }
    jobPost.jobTitle = jobTitle || jobPost.jobTitle;
    jobPost.jobDescription = jobDescription || jobPost.jobDescription;
    jobPost.category = category.length > 0 ? category.map(id => new mongoose.Types.ObjectId(id)) : jobPost.category;
    jobPost.budget = budget || jobPost.budget;
    jobPost.location = location || jobPost.location;
    jobPost.deadline = deadline || jobPost.deadline;
    await jobPost.save();

    res.status(200).json({
      message: "Job post updated successfully",
      job: jobPost
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
