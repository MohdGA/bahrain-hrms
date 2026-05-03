require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const connectDB   = require('./config/db');

const app = express();
connectDB();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

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
app.use('/api/settings',    require('./routes/settings'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Bahrain HRMS Server running on port ${PORT}`));
