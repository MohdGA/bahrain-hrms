require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const path      = require('path');
const fs        = require('fs');
const connectDB = require('./config/db');

const app = express();
connectDB();

// Security
app.use(helmet({ contentSecurityPolicy: false }));

// CORS — enforce allowlist only if CORS_ORIGIN is explicitly set in env
// (when frontend and backend share the same Render domain, no restriction needed)
if (process.env.CORS_ORIGIN) {
  const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('CORS: origin not allowed'));
    },
    credentials: true,
  }));
} else {
  app.use(cors()); // permissive — safe since all data routes are JWT-protected
}
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// General rate limit — all API routes
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/', limiter);

// Strict rate limit on auth endpoints — max 10 attempts per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/employees/login',    authLimiter);
app.use('/api/employees/register', authLimiter);

// Routes
app.use('/api/employees',     require('./routes/employees'));
app.use('/api/payroll',       require('./routes/payroll'));
app.use('/api/wps',           require('./routes/wps'));
app.use('/api/documents',     require('./routes/documents'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/leave',         require('./routes/leave'));
app.use('/api/recruitment',   require('./routes/recruitment'));
app.use('/api/performance',   require('./routes/performance'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/settings',      require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages',      require('./routes/messages'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Serve built React app — works automatically once frontend/dist exists
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) =>
    res.sendFile(path.join(distPath, 'index.html'))
  );
} else {
  app.get('/', (req, res) => res.json({ status: 'API running', note: 'Frontend not built yet' }));
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TechNote server running on port ${PORT}`));
