const Ticket = require('../models/ticketModel');
const TicketMessage = require('../models/ticketmessageModel');
const User = require("../models/userModel");

const createTicket = async (req, res) => {
  try {
    const user_id = req.user.id; 
    const { subject, message } = req.body;

    const newTicket = new Ticket({
      user_id,
      subject,
      message,
    });

    await newTicket.save();

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket: newTicket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const answerTicket = async (req, res) => {
    try {
      const userId = req.user.id; 
      const { ticketId, message } = req.body;
      const user = await User.findById(userId).populate('role');
      if (!user || !user.role) {
        return res.status(404).json({ message: 'User or role not found' });
      }
      const roleName = user.role.roleName;
      if (roleName !== 'admin' && roleName !== 'Admin') {
        return res.status(403).json({ message: 'Unauthorized: Only admin can reply to tickets' });
      }
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      const reply = new TicketMessage({
        ticket: ticketId,
        message
      });
  
      await reply.save();
  
      return res.status(201).json({
        success: true,
        message: 'Reply added to ticket successfully',
        reply
      });
  
    } catch (error) {
      console.error('Error replying to ticket:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  const updateTicketStatus = async (req, res) => {
    try {
      const userId = req.user.id;
      const { ticketId, status } = req.body;
      const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
      }
      const user = await User.findById(userId).populate('role');
      if (!user || !user.role) {
        return res.status(404).json({ message: 'User or role not found' });
      }
      const roleName = user.role.roleName;
      if (roleName !== 'admin' && roleName !== 'Admin') {
        return res.status(403).json({ message: 'Unauthorized: Only admin can update ticket status' });
      }
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      ticket.status = status;
      ticket.updatedAt = new Date();
  
      await ticket.save();
  
      return res.status(200).json({
        success: true,
        message: 'Ticket status updated successfully',
        ticket
      });
  
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  const getUserTicketsWithMessages = async (req, res) => {
    try {
      const userId = req.user.id;
      const tickets = await Ticket.find({ user_id: userId }).lean();
      const ticketsWithMessages = await Promise.all(
        tickets.map(async (ticket) => {
          const messages = await TicketMessage.find({ ticket: ticket._id })
            .sort({ createdAt: 1 })
            .lean();
  
          return {
            ...ticket,
            messages
          };
        })
      );
  
      return res.status(200).json({
        success: true,
        tickets: ticketsWithMessages
      });
  
    } catch (error) {
      console.error("Error fetching tickets with messages:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  };
  

  const getAllTicketsWithMessagesForAdmin = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const user = await User.findById(userId).populate('role');
      if (!user || !user.role) {
        return res.status(404).json({ message: 'User or role not found' });
      }
  
      const roleName = user.role.roleName;
      if (roleName !== 'admin' && roleName !== 'Admin') {
        return res.status(403).json({ message: 'Unauthorized: Only admin can view all tickets' });
      }
  
      const tickets = await Ticket.find().lean();
  
      const ticketsWithMessages = await Promise.all(
        tickets.map(async (ticket) => {
          const messages = await TicketMessage.find({ ticket: ticket._id })
            .sort({ createdAt: 1 })
            .lean();
  
          return {
            ...ticket,
            messages
          };
        })
      );
  
      return res.status(200).json({
        success: true,
        tickets: ticketsWithMessages
      });
  
    } catch (error) {
      console.error('Error fetching tickets for admin:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


  const getTicketMessagesByTicketId = async (req, res) => {
    try {
      const userId = req.user.id;
      const ticketId = req.params.ticketId;
  
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
  
      const user = await User.findById(userId).populate('role');
      if (!user || !user.role) {
        return res.status(404).json({ message: 'User or role not found' });
      }
  
      const roleName = user.role.roleName;
      const isAdmin = roleName === 'admin' || roleName === 'Admin';
      const isOwner = ticket.user_id.toString() === userId.toString();
  
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: 'Unauthorized: You do not have access to this ticket' });
      }
  
      const messages = await TicketMessage.find({ ticket: ticketId })
        .sort({ createdAt: 1 }) 
        .lean();
  
      return res.status(200).json({
        success: true,
        ticketId,
        messages
      });
  
    } catch (error) {
      console.error('Error fetching ticket messages:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
  
  

module.exports = { createTicket, answerTicket, updateTicketStatus, getUserTicketsWithMessages, getAllTicketsWithMessagesForAdmin, getTicketMessagesByTicketId };
