const express = require('express');
const { createCategory, getAllCategories, deleteCategory ,getTopCategories} = require('../controllers/categoryTours');
const authenticateUser = require('../middlewares/authentication');

const categoryToursRouter = express.Router();
categoryToursRouter.post('/', authenticateUser, createCategory);
categoryToursRouter.get('/', getAllCategories);
categoryToursRouter.get('/top', getTopCategories);
categoryToursRouter.delete('/:categoryId', authenticateUser, deleteCategory);

module.exports = categoryToursRouter;
