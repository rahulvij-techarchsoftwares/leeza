const Profile = require("../models/profileModel"); 
const CompanyProfile = require('../models/companyprofileModel');
const User = require("../models/userModel");
const Role = require("../models/roleModel");

exports.addOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    let profile = await Profile.findOne({ user_id: userId });

    if (profile) {
      Object.keys(updates).forEach(key => {
        profile[key] = updates[key];
      });
      await profile.save();
    } else {
      profile = new Profile({
        user_id: userId,
        ...updates
      });
      await profile.save();
    }
    const user = await User.findById(userId);
    if (user) {
      if (updates.phone) user.phone = updates.phone;
      if (updates.email) user.email = updates.email;
      if (updates.subCategories) user.subCategories = updates.subCategories;
      await user.save();
    }

    return res.status(200).json({ message: profile.createdAt ? "Profile created successfully." : "Profile updated successfully.", profile });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await Profile.findOne({ user_id: userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    const user = await User.findById(userId)
      .populate({
        path: 'role',
        select: 'roleName subCategories',
        populate: {
          path: 'subCategories',
          select: '_id name'
        }
      })
      .select('phone email subCategories');
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
    const subCategoriesDetails = user.role.subCategories.filter(subCategory =>
      user.subCategories.includes(subCategory._id)
    );

    res.status(200).json({
      profile,
      user: {
        phone: user.phone,
        email: user.email,
        subCategories: subCategoriesDetails, 
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

  

  exports.addOrUpdateCompanyProfile = async (req, res) => {
    try {
      const company_id = req.user.id;
      const data = req.body;
  
      let profile = await CompanyProfile.findOne({ company_id });
  
      if (profile) {
        Object.keys(data).forEach(key => {
          profile[key] = data[key];
        });
  
        await profile.save();
  
        return res.status(200).json({
          message: 'Company profile updated successfully',
          profile
        });
      } else {
        const newProfile = new CompanyProfile({
          company_id,
          ...data
        });
  
        await newProfile.save();
  
        return res.status(201).json({
          message: 'Company profile created successfully',
          profile: newProfile
        });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };

  exports.getCompanyProfile = async (req, res) => {
    try {
      const companyProfile = await CompanyProfile.findOne({ company_id: req.user.id });
  
      if (!companyProfile) {
        return res.status(404).json({ message: "Company profile not found." });
      }
  
      res.status(200).json({
        message: "Company profile fetched successfully",
        profile: companyProfile
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };