require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const path        = require('path');
const connectDB   = require('./config/db');

const app = express();
connectDB();

const isProd = process.env.NODE_ENV === 'production';

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: isProd ? process.env.CLIENT_URL || '*' : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
if (!isProd) app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Routes
app.use('/api/employees',  require('./routes/employees'));
app.use('/api/payroll',    require('./routes/payroll'));
app.use('/api/wps',        require('./routes/wps'));
app.use('/api/documents',  require('./routes/documents'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/leave',       require('./routes/leave'));
app.use('/api/recruitment', require('./routes/recruitment'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/projects',    require('./routes/projects'));
app.use('/api/settings',       require('./routes/settings'));
app.use('/api/notifications',  require('./routes/notifications'));
app.use('/api/messages',       require('./routes/messages'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Serve React frontend in production
if (isProd) {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Bahrain HRMS Server running on port ${PORT}`));
