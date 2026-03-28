const express = require('express');
const cors = require('cors');
// --- 1. Import Dashboard Repo ไว้ด้านบน ---
const { getDashboardData } = require('./repositories/dashboard.repo'); 

const healthRoutes = require('./routes/health.routes');
const bookRoutes = require('./routes/books.routes');
const usersRoutes = require("./routes/users.routes");
const authRouter = require('./routes/auth.routes');
const meRouter = require('./routes/me.routes');
const borrowsRouter = require('./routes/borrows.routes');
const returnsRouter = require('./routes/returns.routes');

const app = express();

app.use(cors());
app.use(express.json());

// --- 2. วาง Route Dashboard ไว้ก่อนหน้า Middleware อื่นๆ ---
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const data = await getDashboardData();
    res.json(data);
  } catch (error) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Routes ปกติ
app.use('/health', healthRoutes);
app.use('/api/books', bookRoutes);
app.use("/api/users", usersRoutes);
app.use('/auth', authRouter);
app.use('/me', meRouter);
app.use('/api/borrows', borrowsRouter);
app.use('/api/returns', returnsRouter);

// --- 3. Middlewares (ต้องอยู่ท้ายสุดเสมอ) ---
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

app.use(notFound); // ถ้า Request มาไม่ถึงข้างบน จะมาติดที่นี่
app.use(errorHandler);

module.exports = app;