const express = require('express');

const {
    createRating,
    editRating,
    deleteRating,
} = require('../controllers/ratingToTours');

const authenticateUser = require('../middlewares/authentication');

const ratingRouter = express.Router();


ratingRouter.post('/', authenticateUser, createRating);
ratingRouter.put('/', authenticateUser, editRating);
ratingRouter.post('/delete', authenticateUser, deleteRating);
module.exports = ratingRouter;