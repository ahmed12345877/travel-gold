const path = require('path');
const express = require('express');

// Load environment variables
require('dotenv').config();

// Create Express app if not imported from server
let app;
try {
  // Try to import from server/index.js if it exports app
  app = require('./server/index.js');
} catch (error) {
  console.log('[v0] Server/index.js does not export app, creating new app');
  app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Import routes
  try {
    const routes = require('./server/routers');
    Object.keys(routes).forEach(key => {
      app.use('/api', routes[key]);
    });
  } catch (e) {
    console.warn('[v0] Could not load routes:', e.message);
  }
}

// Serve static files from Vite build
const clientBuildPath = path.join(__dirname, 'client', 'dist');
console.log('[v0] Serving static files from:', clientBuildPath);
app.use(express.static(clientBuildPath));

// API health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback to index.html for SPA (must be after API routes)
app.get('*', (req, res) => {
  const indexPath = path.join(clientBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('[v0] Error sending index.html:', err);
      res.status(404).send('Not found');
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[v0] Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`[v0] Server running on ${HOST}:${PORT}`);
  console.log(`[v0] Environment: ${process.env.NODE_ENV}`);
  console.log(`[v0] Frontend: ${clientBuildPath}`);
});
