const express = require('express');
const healthRoutes = require('./routes/health.routes');
const bookRoutes = require('./routes/books.routes');
const usersRoutes = require("./routes/users.routes");
const authRouter = require('./routes/auth.routes');
const meRouter = require('./routes/me.routes');
const borrowsRouter = require('./routes/borrows.routes');
const returnsRouter = require('./routes/returns.routes');

const app = express();
// Middleware สำหรับอ่าน JSON body
app.use(express.json());

// Routes
app.use('/health', healthRoutes);
app.use('/books', bookRoutes);
app.use("/users", usersRoutes);
app.use('/auth', authRouter);
app.use('/me', meRouter);
app.use('/borrows', borrowsRouter);
app.use('/returns', returnsRouter);

// Middlewares ต้องอยู่หลัง Routes เสมอ
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;