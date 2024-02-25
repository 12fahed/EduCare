// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files (index.html)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  res.header("Content-Type", "text/html");

});

// Store connected users with their chosen names
const connectedUsers = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Listen for user's chosen name
  socket.on('set username', (username) => {
    // Assign the chosen name to the user
    connectedUsers[socket.id] = { username };

    // Broadcast updated connected users to all clients
    io.emit('connected users', Object.values(connectedUsers));
  });

  // Listen for chat messages
  socket.on('chat message', (msg) => {
    // Broadcast the message to all clients
    io.emit('chat message', { user: connectedUsers[socket.id].username, message: msg });
  });

  // Listen for user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
    // Remove the user from the connected users list
    delete connectedUsers[socket.id];
    // Broadcast updated connected users to all clients
    io.emit('connected users', Object.values(connectedUsers));
  });
});

server.listen(5173, () => {
  console.log('Server listening on port 3000');
});