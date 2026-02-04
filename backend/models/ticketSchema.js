const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    reason: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
    messages: [
        {
            sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            message: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', ticketSchema);