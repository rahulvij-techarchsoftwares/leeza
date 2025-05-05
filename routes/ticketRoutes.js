const express = require('express');
const router = express.Router();
const { createTicket, answerTicket, updateTicketStatus, getUserTicketsWithMessages, getAllTicketsWithMessagesForAdmin, getTicketMessagesByTicketId } = require('../controllers/ticketController');
const { authenticate } = require("../controllers/userController");

router.post('/create-ticket', authenticate, createTicket);
router.post('/answer-ticket', authenticate, answerTicket);
router.put('/update-ticket-status', authenticate, updateTicketStatus);
router.get('/user-ticket-details', authenticate, getUserTicketsWithMessages);
router.get('/all-user-ticket-details', authenticate, getAllTicketsWithMessagesForAdmin);
router.get('/ticket-messages/:ticketId', authenticate, getTicketMessagesByTicketId);

module.exports = router;
