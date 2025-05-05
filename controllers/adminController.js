const User = require('../models/userModel');
const Role = require('../models/roleModel');
const Profile = require('../models/profileModel');
const CompanyProfile = require('../models/companyprofileModel');

const getAllUserDetailsForAdmin = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const user = await User.findById(userId).populate('role');
      if (!user || !user.role) {
        return res.status(404).json({ message: 'User or role not found' });
      }
  
      const roleName = user.role.roleName;
      if (roleName.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized: Only admin can access this resource' });
      }
  
      const allUsers = await User.find().populate('role');
  
      const detailedUsers = await Promise.all(
        allUsers.map(async (usr) => {
          let detailedProfile = null;
  
          const userRoleName = usr.role.roleName.toLowerCase();
  
          if (userRoleName === 'creator') {
            detailedProfile = await Profile.findOne({ user_id: usr._id }).lean();
          } else if (userRoleName === 'company') {
            detailedProfile = await CompanyProfile.findOne({ company_id: usr._id }).lean();
          }
          const roleWithSubcategories = await Role.findById(usr.role._id).lean();
          const allRoleSubcategories = roleWithSubcategories?.subCategories || [];
          const filteredSubcategories = allRoleSubcategories.filter(sub =>
            usr.subCategories.some(userSub => userSub.toString() === sub._id.toString())
          );
  
          return {
            userId: usr._id,
            email: usr.email,
            phone: usr.phone,
            role: usr.role.roleName,
            subCategories: filteredSubcategories, 
            detailedProfile
          };
        })
      );
  
      return res.status(200).json({
        success: true,
        users: detailedUsers
      });
  
    } catch (error) {
      console.error('Error fetching admin user details:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  const getUserDetailsByIdForAdmin = async (req, res) => {
    try {
      const adminId = req.user.id;
      const adminUser = await User.findById(adminId).populate('role');
      if (!adminUser || !adminUser.role || adminUser.role.roleName.toLowerCase() !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized: Only admin can access this resource' });
      }
  
      const userIdToFetch = req.params.id;
  
      const user = await User.findById(userIdToFetch).populate('role');
      if (!user || !user.role) {
        return res.status(404).json({ message: 'User or role not found' });
      }
  
      const roleName = user.role.roleName.toLowerCase();
      let detailedProfile = null;
  
      if (roleName === 'creator') {
        detailedProfile = await Profile.findOne({ user_id: user._id }).lean();
      } else if (roleName === 'company') {
        detailedProfile = await CompanyProfile.findOne({ company_id: user._id }).lean();
      }
      const roleWithSubcategories = await Role.findById(user.role._id).lean();
      const allRoleSubcategories = roleWithSubcategories?.subCategories || [];
      const filteredSubcategories = allRoleSubcategories.filter(sub =>
        user.subCategories.some(userSub => userSub.toString() === sub._id.toString())
      );
  
      return res.status(200).json({
        success: true,
        user: {
          userId: user._id,
          email: user.email,
          phone: user.phone,
          role: user.role.roleName,
          subCategories: filteredSubcategories,
          detailedProfile
        }
      });
  
    } catch (error) {
      console.error('Error fetching user details by ID for admin:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  const adminAddOrUpdateUserProfile = async (req, res) => {
    try {
      const adminId = req.user.id; 
      const userId = req.params.id; 
      const updates = req.body;
      const adminUser = await User.findById(adminId).populate('role');
      if (!adminUser || !adminUser.role || !['admin', 'Admin'].includes(adminUser.role.roleName)) {
        return res.status(403).json({ message: 'Unauthorized: Only admin can access this route' });
      }
      let profile = await Profile.findOne({ user_id: userId });
  
      if (profile) {
        Object.keys(updates).forEach(key => {
          profile[key] = updates[key];
        });
  
        await profile.save();
        return res.status(200).json({ message: "Profile updated successfully.", profile });
      } else {
        const newProfile = new Profile({
          user_id: userId,
          ...updates
        });
  
        await newProfile.save();
        return res.status(201).json({ message: "Profile created successfully.", profile: newProfile });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


  const adminAddOrUpdateCompanyProfile = async (req, res) => {
    try {
      const adminId = req.user.id; 
      const company_id = req.params.id; 
      const data = req.body;
      const adminUser = await User.findById(adminId).populate('role');
      if (!adminUser || !adminUser.role || !['admin', 'Admin'].includes(adminUser.role.roleName)) {
        return res.status(403).json({ message: 'Unauthorized: Only admin can access this route' });
      }
  
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

module.exports = { getAllUserDetailsForAdmin, getUserDetailsByIdForAdmin, adminAddOrUpdateUserProfile, adminAddOrUpdateCompanyProfile };
