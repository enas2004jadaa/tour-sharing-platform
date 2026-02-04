const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./models/db');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(cors({ origin: '*' , credentials: true }));

const usersRouter = require('./routes/users');
const categoryToursRouter = require('./routes/category');
const toursRouter = require('./routes/tours');
const adminRouter = require('./routes/admin');
const commentRouter = require('./routes/comments');
const ratingRouter = require('./routes/rating');
const ticketRouter = require('./routes/ticket');

app.use('/admin', adminRouter);
app.use('/categories', categoryToursRouter);
app.use('/tours', toursRouter);
app.use('/users', usersRouter);
app.use('/comments', commentRouter);
app.use('/ratings', ratingRouter);
app.use('/tickets', ticketRouter);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});

