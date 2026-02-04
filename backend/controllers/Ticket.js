const ticketSchema = require('../models/ticketSchema');

const createTicket = (req, res) => {
    const { reason, description } = req.body;
    const user = req.user._id;
    if (!reason || !user) {
        return res.status(400).json({ message: "Reason is required." });
    }
    const ticket = new ticketSchema({
        reason,
        user,
        description
    });
    ticket
    .save()
    .then(() => {
        res.status(201).json({
            message: "Ticket created successfully."
        });
    })
    .catch((err) =>
      res.status(500).json({ message: "Error creating ticket.", error: err })
    );
}

const getTicketsByUser = (req, res) => {
    const userId = req.params.userId;
    ticketSchema.find({ user: userId })
    .then((tickets) => {
        res.status(200).json({ tickets });
    })
    .catch((err) =>
      res.status(500).json({ message: "Error fetching tickets.", error: err })
    );
}

const messageFromUser = (req, res) => {
    const ticketId = req.params.ticketId;
    const { message } = req.body;
    const userId = req.user._id;
    if (!message) {
        return res.status(400).json({ message: "Message cannot be empty." });
    }
    ticketSchema.findOneAndUpdate(
        { _id: ticketId },
        { $push: { messages: { sender: userId, message: message, timestamp : Date.now() } }, updatedAt: Date.now() },
        { new: true }
    )
    .then((updatedTicket) => {
        if (!updatedTicket) {
            return res.status(404).json({ message: "Ticket not found." });
        }
        res.status(200).json(updatedTicket);
    })
    .catch((err) =>
      res.status(500).json({ message: "Error sending message.", error: err })
    );
}

const getOneTicket = (req, res) => {
    const ticketId = req.params.ticketId;
    const userId = req.user._id;
    ticketSchema.findOne({ _id: ticketId, user: userId })
    .then((ticket) => {
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found." });
        }
        res.status(200).json(ticket);
    })
    .catch((err) =>
      res.status(500).json({ message: "Error fetching ticket.", error: err })
    );
}

const closeTicket = (req, res) => {
    const ticketId = req.params.ticketId;
    const userId = req.user._id;
    ticketSchema.findOneAndUpdate(
        { _id: ticketId, user: userId },
        { status: 'closed', updatedAt: Date.now() },
        { new: true }
    )
    .then((updatedTicket) => {
        if (!updatedTicket) {
            return res.status(404).json({ message: "Ticket not found." });
        }
        res.status(200).json(updatedTicket);
    })
    .catch((err) =>
      res.status(500).json({ message: "Error closing ticket.", error: err })
    );
}



module.exports = {
    createTicket,
    getTicketsByUser,
    getOneTicket,
    closeTicket,
    messageFromUser
};