const Ticket = require('../models/ticketModel');
const User = require("../models/userModel");
const Role = require("../models/roleModel");

exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    const ticket = await Ticket.create({
      user: req.user.id,
      subject,
      messages: [{
        sender: req.user.id,
        senderRole: 'user',
        message
      }]
    });
    req.io.emit('new_ticket', ticket); 
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
    if (!ticket.user.equals(user_id)) {
      const user = await User.findById(user_id);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const role = await Role.findById(user.role);
      console.log("this is role", role);
      if (!role || !['admin', 'Admin'].includes(role.roleName)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
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
    console.log("this is role", role);
    if (!role || !['admin', 'Admin'].includes(role.roleName)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const tickets = role.roleName === 'admin' || role.roleName === 'Admin'
    ? await Ticket.find({ user: ownerId }).populate('user', 'name email')
    : await Ticket.find({ user: user_id }).populate('user', 'name email');

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

    return res.status(200).json({ message: 'Ticket status updated successfully', ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


