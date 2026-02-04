const mongoose = require('mongoose');
const { create } = require('./userSchema');

const logAdminSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    details: {
        type: String
    }
});

module.exports = mongoose.model('LogAdmin', logAdminSchema);