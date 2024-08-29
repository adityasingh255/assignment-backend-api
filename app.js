const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const uploadRoutes = require('./routes/upload');

const app = express();

// MongoDB Connection
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', uploadRoutes);

module.exports = app;
