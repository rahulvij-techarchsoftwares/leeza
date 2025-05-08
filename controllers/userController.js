const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const mongoose = require("mongoose");
const { sendEmail } = require("../service/email");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

exports.signupUser = async (req, res) => {
  try {
    const {
      phone,
      email,
      password,
      role,
      subCategories
    } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    const selectedRole = await Role.findById(role);
    if (!selectedRole) {
      return res.status(400).json({ message: "Invalid role selected." });
    }

    const roleSubCatIds = selectedRole.subCategories.map((sc) => sc._id.toString());
    const validSubCategories = subCategories.map((scId) => new mongoose.Types.ObjectId(scId));

    const isValidSubCategories = validSubCategories.every((scId) =>
      roleSubCatIds.includes(scId.toString()) 
    );

    if (!isValidSubCategories) {
      return res.status(400).json({ message: "Invalid subCategories for the selected role." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      phone,
      email,
      password: hashedPassword,
      role,
      subCategories: subCategories.map(id => new mongoose.Types.ObjectId(id))
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "5h"
    });


    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: 'Lax', 
      maxAge: 5 * 60 * 60 * 1000 
    });

    await sendEmail({
      to: newUser.email,
      subject: "🎉 Welcome to Our Platform!",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4CAF50;">🎉 Welcome to Our Platform!</h2>
          <p style="font-size: 16px; color: #333;">
            Hi <strong>${newUser.email}</strong>,
          </p>
          <p style="font-size: 16px; color: #333;">
            You have successfully signed up with us. We're thrilled to have you on board!
          </p>
          <p style="font-size: 16px; color: #333;">
            Your account is now active and ready to use.
          </p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 14px; color: #888;">
            If you did not sign up for this account, please ignore this email or contact support.
          </p>
          <p style="font-size: 16px; color: #4CAF50;">
            – The Team
          </p>
        </div>
      `
    });

    res.status(201).json({
      message: "User registered successfully",
      // token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: selectedRole.roleName
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).populate("role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

      const isMatch = await bcrypt.compare(password, user.password);
        
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const roleDoc = await Role.findById(user.role._id);
      const selectedSubCategories = roleDoc.subCategories.filter((sub) =>
        user.subCategories.some((scId) => scId.toString() === sub._id.toString())
      );
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: 'Lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
      
      res.status(200).json({
        message: "Login successful",
        // token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: {
            id: user.role._id,
            name: user.role.roleName
          },
          subCategories: selectedSubCategories.map((sc) => ({
            id: sc._id,
            name: sc.name
          }))
        }
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  exports.forgotPassword = async (req, res) => {
    try {
      const { email, newPassword } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User with this email does not exist." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      user.password = hashedPassword;
      await user.save();
      await sendEmail({
        to: email,
        subject: "🔒 Your Password Has Been Reset",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #f44336;">🔐 Password Reset Confirmation</h2>
            <p style="font-size: 16px; color: #333;">
              Hello <strong>${email}</strong>,
            </p>
            <p style="font-size: 16px; color: #333;">
              Your password has been successfully reset.
            </p>
            <p style="font-size: 16px; color: #333;">
              If you did not perform this action, please change your password immediately or contact our support team.
            </p>
            <hr style="margin: 20px 0;">
            <p style="font-size: 14px; color: #888;">
              Thank you for using our platform.
            </p>
            <p style="font-size: 16px; color: #f44336;">
              – The Team
            </p>
          </div>
        `
      });
      res.status(200).json({ message: "Password updated successfully." });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


exports.authenticate = async (req, res, next) => {
  // console.log('Cookies:', req.cookies);
  // const authHeader = req.headers.authorization;

  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return res.status(401).json({ message: "Authorization token missing or invalid." });
  // }

  // const token = authHeader.split(" ")[1];
  const token = req.cookies.token; 

  if (!token) {
    return res.status(401).json({ message: "Authorization token missing or invalid." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log(decoded);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = {
      id: user._id,
      role: user.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};


exports.authenticateSocket = async (socket, next) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || '');
  const token = cookies.token;
  if (!token) {
    return next(new Error("Authorization token missing or invalid."));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("User not found."));
    }
    socket.user = {
      id: user._id,
      role: user.role,
    };

    console.log(`Authenticated user ${user._id} with role ${user.role}`);
    next();  
  } catch (err) {
    return next(new Error("Invalid or expired token."));
  }
};