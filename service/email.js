const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmail = async (data) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "backend1@techarchsoftwares.com",
          pass: "dbnc bpol pisd xikg",
        },
      });
      const mailOptions = {
        from: '"leeza" <backend1@techarchsoftwares.com>',
        to: data.to,           
        subject: data.subject, 
        html: data.body,       
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      return { success: true, previewURL: nodemailer.getTestMessageUrl(info) };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }
  };
  
module.exports = { 
    router, 
    generateOTP, 
    sendEmail 
  };