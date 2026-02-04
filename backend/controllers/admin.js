const User = require("../models/userSchema");
const Tour = require("../models/tourSchema");
const LogAdmin = require("../models/logAdmin");
const ticketSchema = require("../models/ticketSchema");


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    await LogAdmin.create({
      user: req.user.id,
      action: 'delete_user',
      details: `User deleted: ${user.email}`
    });

    res.status(200).json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find().populate('publisher', 'firstName lastName email').populate('category', 'name').populate("comments").populate("ratings");
    res.status(200).json(tours);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const deleteTourById = async (req, res) => {
  const { tourId } = req.params;
  const { action } = req.body;
  console.log("Action =>", action);
  
  try {
    const tour = await Tour.findByIdAndUpdate(tourId, { isDeleted: action }, { new: true });
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    
    await LogAdmin.create({
      user: req.user.id,
      action: 'delete_tour',
      details: `Tour ${action ? 'deleted' : 'restored'}: ${tour.title}`
    });

    res.status(200).json({ message: `Tour ${action ? 'deleted' : 'restored'} successfully`, tour });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



const approveTourById = async (req, res) => {
  const { tourId } = req.params;
  try {
    const tour = await Tour.findByIdAndUpdate(
      tourId,
      { status: 'approved' },
      { new: true }
    ).populate('publisher', 'firstName lastName');
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    await LogAdmin.create({
      user: req.user.id,
      action: 'approve_tour',
      details: `Tour approved: ${tour.name} by ${tour.publisher.firstName} ${tour.publisher.lastName}`
    });

    res.status(200).json({ message: "Tour approved successfully", tour });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
const rejectTourById = async (req, res) => {

  const { tourId } = req.params;
  try {
    const tour = await Tour.findByIdAndUpdate(
      tourId,
      { status: 'rejected' },
      { new: true }
    );
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    await LogAdmin.create({
      user: req.user.id,
      action: 'reject_tour',
      details: `Tour rejected: ${tour.title}`
    });

    res.status(200).json({ message: "Tour rejected successfully", tour });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body; 
  
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await LogAdmin.create({
      user: req.user.id,
      action: 'update_user_role',
      details: `User role updated: ${user.email} to role ${role}`
    });
    res.status(200).json({ message: "User role updated successfully", user });
  } catch (error) { 
    res.status(500).json({ message: "Server error", error });
  }
};


const getAllTickets = async (req, res) => {
  try {
    
    
    const tickets = await ticketSchema.find().populate('user', 'firstName lastName email').populate({
      path: 'messages.sender',
      select: 'firstName lastName email'
    });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getTicketsById = async (req, res) => {
  const { ticketId } = req.params;
  try {
    const ticket = await ticketSchema.findById(ticketId).populate('user', 'firstName lastName email')
    .populate({
      path: 'messages.sender',
      select: 'firstName lastName email'
    });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const sendMessageForTicket = async (req, res) => {
  const { ticketId } = req.params;
  const { message } = req.body;
  const userId = req.user._id;
  try {
    const ticket = await ticketSchema.findOne({ _id: ticketId });
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }
    ticket.messages.push({ sender: userId, message, timestamp: Date.now() });
    ticket.updatedAt = Date.now();
    await ticket.save();
    res.status(200).json({ message: "Message sent successfully.", ticket });
  } catch (err) {
    res.status(500).json({ message: "Error sending message.", error: err });
  }
};

const closeTicketByAdmin = async (req, res) => {
  const { ticketId } = req.params;
  try {
    const ticket = await ticketSchema.findByIdAndUpdate(
      ticketId,
      { status: 'closed', updatedAt: Date.now() },
      { new: true }
    );
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }
    res.status(200).json({ message: "Ticket closed successfully.", ticket });
  } catch (err) {
    res.status(500).json({ message: "Error closing ticket.", error: err });
  }
};

const openTicketByAdmin = async (req, res) => {
  const { ticketId } = req.params;
  try {
    const ticket = await ticketSchema.findByIdAndUpdate(
      ticketId,
      { status: 'open', updatedAt: Date.now() },
      { new: true }
    );
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." });
    }
    res.status(200).json({ message: "Ticket opened successfully.", ticket });
  } catch (err) {
    res.status(500).json({ message: "Error opening ticket.", error: err });
  }
};

const getAllLogs = async (req, res) => {
  try {
    const logs = await LogAdmin.find().populate('user', 'firstName lastName email role');
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getAllUsers,
  deleteUserById,
  getAllTours,
  deleteTourById,
  approveTourById,
  rejectTourById,
  updateUserRole,
  getAllTickets,
  getTicketsById,
  sendMessageForTicket,
  closeTicketByAdmin,
  openTicketByAdmin,
  getAllLogs
};
