const JobPost = require("../models/jobsModel");
const Role = require("../models/roleModel");
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
