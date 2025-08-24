require('dotenv').config();

const express = require('express');
const prisma = require('../configs/database');
const errorHandlerMiddleware = require('src/middlewares/error_middleware');

// Import Routes 
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(errorHandlerMiddleware);


// Routes 
app.use('/api/v1/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;