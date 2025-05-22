// Server setup
import { Server } from 'socket.io';
import { createServer } from 'http';
import { User } from './User';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  const user = new User(socket);
  
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    user.handleDisconnect();
  });
  socket.onAny((event, ...args) => {
    console.log(`📩 Received event: ${event}`, args);
  });
});

httpServer.listen(8008, () => {
  console.log('Multiplayer server running on port 8008');
});