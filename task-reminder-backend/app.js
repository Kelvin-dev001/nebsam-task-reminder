require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const attachUser = require('./middleware/attachUser');

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Error:', err));

const allowedOrigins = [
  'http://localhost:3000',
  'https://nebsam-task-reminder.vercel.app',
];

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server / local tools with no Origin
      if (!origin || allowedOrigins.includes(origin)) return cb(null, origin);
      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

// Core routes
// Customer phone-based auth (signup/login with OTP)
app.use('/customer-auth', require('./routes/customerAuthRoutes'));

// Existing staff auth flows
app.use('/auth', require('./routes/authRoutes'));
app.use('/departments', require('./routes/departmentRoutes'));
app.use('/tasks', require('./routes/taskRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Complaints now fully protected in complaintRoutes.js
app.use('/complaints', require('./routes/complaintRoutes'));

app.use('/memos', require('./routes/memoRoutes'));

// Analytics + reports + showrooms
app.use('/analytics', require('./routes/analyticsRoutes')); // /analytics/daily, /analytics/trends, /analytics/submission-status, /analytics/monthly, /analytics/monthly-series
app.use('/', require('./routes/dailyReports')); // /reports
app.use('/showrooms', require('./routes/showroomRoutes')); // /showrooms/list

app.get('/', (req, res) => res.send('Task Reminder API Running'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

// Only start the server if run directly (not in tests or scripts)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
}

module.exports = app;