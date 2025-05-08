const Ticket = require('../models/ticketModel');
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const { sendEmail } = require('../service/email');

exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    const ticket = await Ticket.create({
      user: req.user.id,
      subject,
      messages: []
      // messages: [{x
      //   sender: req.user.id,
      //   senderRole: 'user',
      //   message
      // }]
    });
    req.io.emit('new_ticket', ticket); 


    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const adminEmail = 'abc@gmail.com';

    await sendEmail({
      to: adminEmail,
      subject: "🎫 New Support Ticket Raised",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2196f3;">🚨 New Ticket Notification</h2>
          <p style="font-size: 16px; color: #333;">
            A new support ticket has been created by <strong>${user.email}</strong>.
          </p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="margin: 20px 0;">
          <p style="font-size: 14px; color: #888;">
            Please log in to the admin panel to review and respond to the ticket.
          </p>
        </div>
      `
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addMessageToTicket = async (req, res) => {
  const user_id = req.user.id;
  console.log("user id", user_id);
  try {
    const { ticketId } = req.params;
    const { message, senderRole } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    let isAdmin = false;
    if (!ticket.user.equals(user_id)) {
      const user = await User.findById(user_id);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const role = await Role.findById(user.role);
      console.log("this is role", role);
      if (!role || !['admin', 'Admin'].includes(role.roleName)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      isAdmin = true;
    }

    const newMessage = {
      sender: req.user.id,
      senderRole, 
      message
    };

    ticket.messages.push(newMessage);
    ticket.updatedAt = Date.now();
    await ticket.save();
    req.io.to(ticketId).emit('new_message', {
      ticketId,
      ...newMessage
    });

    if (isAdmin) {
      const ticketOwner = await User.findById(ticket.user);
      console.log("sending mail to email", ticketOwner.email);
      if (ticketOwner) {
        await sendEmail({
          to: ticketOwner.email,
          subject: "💬 New Reply to Your Ticket",
          body: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #4CAF50;">New Message on Your Ticket</h2>
              <p>Hello,</p>
              <p>You have received a new message from the support team on your ticket.</p>
              <p><strong>Message:</strong> ${message}</p>
              <p style="margin-top: 20px;">Please log in to your account to view and reply.</p>
              <hr style="margin: 20px 0;">
              <p style="font-size: 14px; color: #888;">This is an automated message. Do not reply to this email.</p>
            </div>
          `
        });
      }
    } else {
      const supportEmail = "abc@gmail.com"; 
      await sendEmail({
        to: supportEmail,
        subject: "📨 New User Message on Ticket",
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2196f3;">User Message Notification</h2>
            <p>A user has sent a message on their ticket.</p>
            <p><strong>Message:</strong> ${message}</p>
            <p>Please check the support panel to respond.</p>
          </div>
        `
      });
    }

    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTickets = async (req, res) => {
  const user_id = req.user.id;
  const { ownerId } = req.params;
  try {
    const user = await User.findById(user_id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const role = await Role.findById(user.role);
    // console.log("this is role", role);

    const isAdmin = role && ['admin', 'Admin'].includes(role.roleName);
    const isOwner = user_id.toString() === ownerId.toString();
    if (!isAdmin && !isOwner) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const tickets = await Ticket.find({ user: ownerId }).populate('user', 'name email');

    if (tickets.length === 0) {
      return res.status(404).json({ error: 'No tickets found for the given ownerId' });
    }

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  const user_id = req.user.id;  
  const { ticketId } = req.params;  

  try {
    const user = await User.findById(user_id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const ticket = await Ticket.findById(ticketId).populate('user', 'name email');
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    // console.log("ticket user id:", ticket.user._id || ticket.user);
    // console.log("logged-in user id:", user_id);
    const isOwner = (ticket.user._id || ticket.user).equals(user_id);
    const role = await Role.findById(user.role);
    const isAdmin = role && ['admin', 'Admin'].includes(role.roleName);
    if (isAdmin || isOwner) {
      return res.status(200).json(ticket);
    } else {
      return res.status(401).json({ error: 'Unauthorized to access this ticket' });
    }
  } catch (error) {
    console.error("Error in getTicketById:", error);
    res.status(500).json({ error: error.message });
  }
};


exports.updateTicketStatus = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { ticketId } = req.params;
    const { status } = req.body;
    const user = await User.findById(user_id);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const role = await Role.findById(user.role);
    console.log("this is role", role);
    if (!role || !['admin', 'Admin'].includes(role.roleName)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = status;
    await ticket.save();


    const ticketOwner = await User.findById(ticket.user);
    if (ticketOwner) {
      await sendEmail({
        to: ticketOwner.email,
        subject: "📌 Ticket Status Updated",
        body: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #f39c12;">Your Ticket Status Changed</h2>
            <p>Hello,</p>
            <p>The status of your support ticket has been updated.</p>
            <p><strong>New Status:</strong> ${status}</p>
            <p style="margin-top: 20px;">Please log in to your account to view more details.</p>
            <hr style="margin: 20px 0;">
            <p style="font-size: 14px; color: #888;">This is an automated message. Do not reply to this email.</p>
          </div>
        `
      });
    }

    return res.status(200).json({ message: 'Ticket status updated successfully', ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('user', 'name email') 
      .populate('messages.sender', 'name email') 
      .sort({ updatedAt: -1 }); 

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


