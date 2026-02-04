const express = require('express');

const {createComment, editComment, deleteComment} = require('../controllers/commentsToTours');
const authenticateUser = require('../middlewares/authentication');

const commentsRouter = express.Router();

commentsRouter.post('/', authenticateUser, createComment);
commentsRouter.put('/', authenticateUser, editComment);
commentsRouter.delete('/:commentId', authenticateUser, deleteComment);

module.exports = commentsRouter;