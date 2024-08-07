const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const clients = new Map();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected');
    const { type, id } = socket.handshake.query;
    if (type === 'client') {
      clients.set(id, socket);
    }

    socket.on('toggle_browser', (data) => {
      const clientSocket = clients.get(data.clientId);
      if (clientSocket) {
        clientSocket.emit('toggle_browser', { enabled: data.enabled });
      }
    });

    socket.on('status', (data) => {
      io.emit('status', { id, status: data.status });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      clients.delete(id);
    });
  });

  // Middleware to add io to req
  server.on('request', (req, res) => {
    req.io = io;
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
