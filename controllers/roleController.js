const Role = require("../models/roleModel");

exports.addRole = async (req, res) => {
    try {
      const { roleName, subCategories } = req.body;
  
      if (!roleName) {
        return res.status(400).json({ message: "roleName is required" });
      }
  
      const existingRole = await Role.findOne({ roleName });
      if (existingRole) {
        return res.status(400).json({ message: "Role already exists" });
      }
  
      const formattedSubCategories = (subCategories || []).map(name => ({
        name
      }));
  
      const role = new Role({
        roleName,
        subCategories: formattedSubCategories,
      });
  
      const savedRole = await role.save();
      res.status(201).json(savedRole);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  exports.getAllRoles = async (req, res) => {
    try {
      const roles = await Role.find(); 
      res.status(200).json(roles);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
