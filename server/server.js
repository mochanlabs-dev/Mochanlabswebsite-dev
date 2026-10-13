require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const helmet    = require('helmet');
const path      = require('path');
const logger    = require('./services/logger');
const { getClientIP, trackVisit } = require('./services/visitTracker');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://api.emailjs.com"],
    }
  }
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://www.mochanlabs.com' : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Visit tracking middleware (before static files)
app.use((req, res, next) => {
  const excludePaths = ['/api/', '/admin/', '/_next/'];
  const ext = path.extname(req.path);
  // Count page views only, not the scripts, styles and images they load.
  const isExcluded = excludePaths.some(p => req.path.startsWith(p)) || (ext && ext !== '.html');

  if (!isExcluded && req.method === 'GET') {
    const ip = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const page = req.path || '/';
    trackVisit(ip, page, userAgent).catch(err => console.error('Track error:', err));
  }
  next();
});

// Public website: the Next.js static export (built into web/out).
// Only these directories are served — never the project root, which would
// expose server code, logs and documents.
const WEB_DIR = path.join(__dirname, '..', 'web', 'out');
app.use(express.static(WEB_DIR));
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/analytics', require('./routes/analytics'));

// Unknown API routes return JSON; anything else gets the site's 404 page.
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});
app.use((req, res) => {
  res.status(404).sendFile(path.join(WEB_DIR, '404.html'));
});

const PORT       = process.env.PORT || 3000;
const MONGO_URI  = process.env.MONGODB_URI;

if (!MONGO_URI) {
  logger.warn('⚠️  WARNING: MONGODB_URI is not set in server/.env');
}

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => {
      logger.info('✅ MongoDB connected successfully');
    })
    .catch(err => {
      logger.error('❌ MongoDB connection failed:', { error: err.message });
      logger.warn('⚠️  Continuing without MongoDB...');
    });
}

app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`, {
    environment: process.env.NODE_ENV,
    node_version: process.version
  });
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📱 Admin dashboard → http://localhost:${PORT}/admin/dashboard.html`);
    console.log(`🌐 Website → http://localhost:${PORT}`);
  }
});
