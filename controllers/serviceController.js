const Otp = require("../models/otpModel"); 
const { generateOTP, sendEmail } = require("../service/email");


exports.sendOTP = async (req, res) => {
    try {
      const { email } = req.body; 
      if (!email) return res.status(400).json({ message: "Email is required" });
      const otp = generateOTP();
      await Otp.findOneAndUpdate(
        { email },
        { otp, createdAt: new Date() },
        { upsert: true, new: true }
      );
  
      const emailContent = {
        to: email,
        subject: "Your OTP Code",
        body: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 30 seconds.</p>`,
      };
  
      const emailResult = await sendEmail(emailContent);
  
      if (emailResult.success) {
        return res.status(200).json({ message: "OTP sent successfully" });
      } else {
        return res.status(500).json({ message: "Failed to send OTP" });
      }
    } catch (error) {
      console.error("Error in sendOTP:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  exports.verifyOTP = async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }
  
      const record = await Otp.findOne({ email });
  
      if (!record) {
        return res.status(400).json({ message: "OTP expired or not found" });
      }
  
      if (record.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      
      await Otp.deleteOne({ email });
  
      return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
      console.error("Error in verifyOTP:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };