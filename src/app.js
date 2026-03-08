const express = require('express');
const healthRoutes = require('./routes/health.routes');
const bookRoutes = require('./routes/books.routes');

const app = express();
app.use(express.json());

app.use('/health', healthRoutes);
app.use('/books', bookRoutes);

module.exports = app;