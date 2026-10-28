// Vercel Function: the Express app in /server, answering every /api/* request
// (see the rewrite in vercel.json). Connects to MongoDB once per warm instance.
const mongoose = require('mongoose');
const app = require('../server/server');

let connecting = null;
function connect() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connecting) {
    connecting = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
      .catch((err) => {
        connecting = null;
        throw err;
      });
  }
  return connecting;
}

module.exports = async (req, res) => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not set');
    await connect();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: 'Database unavailable' }));
  }
  return app(req, res);
};
