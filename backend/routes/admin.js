const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/admin");

const authenticateUser = require("../middlewares/authentication");
const authorizeRoles = require("../middlewares/authorization");

router.use(authenticateUser);

router.get("/users",authorizeRoles('admin', 'moderator'), getAllUsers);

router.delete("/users/:userId",authorizeRoles('admin'), deleteUserById);
router.put("/users/:userId/role",authorizeRoles('admin'), updateUserRole);

router.get("/tours",authorizeRoles('admin', 'moderator'), getAllTours);
router.delete("/tours/:tourId",authorizeRoles('admin'), deleteTourById);
router.put("/tours/:tourId/approve",authorizeRoles('admin', 'moderator'), approveTourById);
router.put("/tours/:tourId/reject",authorizeRoles('admin', 'moderator'), rejectTourById);

router.get('/tickets',authorizeRoles('admin', 'moderator'), getAllTickets);
router.get('/tickets/:ticketId',authorizeRoles('admin', 'moderator'), getTicketsById);
router.post("/tickets/:ticketId/message",authorizeRoles('admin', 'moderator'), sendMessageForTicket);
router.put("/tickets/:ticketId/close",authorizeRoles('admin', 'moderator'), closeTicketByAdmin);
router.put("/tickets/:ticketId/open",authorizeRoles('admin', 'moderator'), openTicketByAdmin);

router.get("/logs",authorizeRoles('admin', 'moderator'), getAllLogs);

module.exports = router;

