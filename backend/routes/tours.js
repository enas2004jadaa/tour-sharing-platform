const express = require('express');
const {
  createTour,
  getAllTours,
  getAllToursByUserId,
  getTourById,
  searchTours,
  filterToursByCategory,
  getPopularTours,
  updateTour,
  deleteTour,
} = require('../controllers/tours');

const {saveTourForUser, getSavedToursByUser} = require('../controllers/saveTour');
const authenticateUser = require('../middlewares/authentication');

const toursRouter = express.Router();

toursRouter.get('/', getAllTours);
toursRouter.get('/search', searchTours);
toursRouter.get('/category/:categoryId', authenticateUser, filterToursByCategory);
toursRouter.get('/popular', getPopularTours);

toursRouter.get('/save/:tourId', authenticateUser, saveTourForUser);
toursRouter.get('/saved', authenticateUser, getSavedToursByUser);

toursRouter.get('/user/:userId', getAllToursByUserId);


toursRouter.get('/:tourId', getTourById);

toursRouter.post('/', authenticateUser, createTour);
toursRouter.put('/:tourId', authenticateUser, updateTour);
toursRouter.delete('/:tourId', authenticateUser, deleteTour);



module.exports = toursRouter;