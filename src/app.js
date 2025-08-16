const express = require('express');
const cors = require('cors');
const swaggerDocs = require('./swagger');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

swaggerDocs(app);

const usersRouter = require('./routes/users');
app.use('/users', usersRouter);

module.exports = app;