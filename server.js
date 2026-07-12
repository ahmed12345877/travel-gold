/**
 * Server.js - cPanel Node.js Application Starter
 * Used when deploying to cPanel shared hosting
 * This file handles the Next.js server startup
 */

const { createServer } = require('http');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Create Next.js app
const app = next({ dev, hostname, port, dir: path.join(__dirname) });
const handle = app.getRequestHandler();

// Start server
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`✓ Server running at http://${hostname}:${port}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
