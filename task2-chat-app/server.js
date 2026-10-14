const path = require('path');
const crypto = require('crypto');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3002;

app.use(express.static(path.join(__dirname, 'public')));

const users = new Map();

io.on('connection', (socket) => {
  socket.on('join', (rawName) => {
    const name = String(rawName || 'Guest').trim().slice(0, 24) || 'Guest';
    users.set(socket.id, name);
    socket.emit('system', { text: `Welcome, ${name}!`, time: new Date().toISOString() });
    socket.broadcast.emit('system', { text: `${name} joined the chat.`, time: new Date().toISOString() });
    io.emit('online-count', users.size);
  });

  socket.on('chat-message', (rawText) => {
    const text = String(rawText || '').trim().slice(0, 500);
    const name = users.get(socket.id) || 'Guest';
    if (!text) return;
    // Broadcast one normalized message object so every client renders the same shape.
    io.emit('chat-message', { id: crypto.randomUUID(), name, text, time: new Date().toISOString() });
  });

  socket.on('typing', (isTyping) => {
    const name = users.get(socket.id) || 'Someone';
    socket.broadcast.emit('typing', { name, isTyping: Boolean(isTyping) });
  });

  socket.on('disconnect', () => {
    const name = users.get(socket.id);
    if (!name) return;
    users.delete(socket.id);
    socket.broadcast.emit('system', { text: `${name} left the chat.`, time: new Date().toISOString() });
    io.emit('online-count', users.size);
  });
});

server.listen(PORT, () => console.log(`Chat app running at http://localhost:${PORT}`));
