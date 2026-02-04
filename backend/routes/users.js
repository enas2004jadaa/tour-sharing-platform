const express = require('express');

const {register, login, getUserById, updateUser} = require('../controllers/users');
const authenticateUser = require('../middlewares/authentication');
const usersRouter = express.Router();

usersRouter.post('/register', register);
usersRouter.post('/login', login);
usersRouter.get('/:id', getUserById);
usersRouter.put('/:id',authenticateUser, updateUser);
module.exports = usersRouter;