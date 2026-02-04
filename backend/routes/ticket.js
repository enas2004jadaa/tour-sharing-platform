const express = require('express');

const {
    createTicket,
    getTicketsByUser,
    messageFromUser,
    getOneTicket,
    closeTicket
} = require('../controllers/Ticket');

const authMiddleware = require('../middlewares/authentication');
const router = express.Router();


router.post('/', authMiddleware, createTicket);
router.get('/user/:userId', authMiddleware, getTicketsByUser);
router.post('/:ticketId/message', authMiddleware, messageFromUser);
router.get('/:ticketId', authMiddleware, getOneTicket);
router.put('/:ticketId/close',authMiddleware, closeTicket);

module.exports = router;