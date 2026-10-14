const path = require('path');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/elitech_editor';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const documentSchema = new mongoose.Schema({
  documentId: { type: String, unique: true, index: true },
  title: { type: String, default: 'Untitled document' },
  content: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});
const Document = mongoose.model('Document', documentSchema);

app.get('/api/documents/:id', async (req, res) => {
  const id = req.params.id.slice(0, 80);
  let doc = await Document.findOne({ documentId: id }).lean();
  if (!doc) doc = { documentId: id, title: 'Untitled document', content: '' };
  res.json(doc);
});

io.on('connection', (socket) => {
  socket.on('join-document', async ({ documentId, userName }) => {
    const id = String(documentId || 'default').slice(0, 80);
    const room = `document:${id}`;
    socket.join(room);
    socket.data.documentId = id;
    socket.data.userName = String(userName || 'Guest').slice(0, 40);
    let doc = await Document.findOne({ documentId: id });
    if (!doc) doc = await Document.create({ documentId: id });
    socket.emit('document-loaded', { title: doc.title, content: doc.content, updatedAt: doc.updatedAt });
    socket.to(room).emit('presence', { userName: socket.data.userName, action: 'joined' });
  });

  socket.on('document-change', async ({ title, content }) => {
    const id = socket.data.documentId;
    if (!id) return;
    const safeTitle = String(title || 'Untitled document').slice(0, 160);
    const safeContent = String(content || '').slice(0, 100000);
    const doc = await Document.findOneAndUpdate(
      { documentId: id },
      { $set: { title: safeTitle, content: safeContent, updatedAt: new Date() } },
      { new: true, upsert: true }
    );
    socket.to(`document:${id}`).emit('document-update', { title: doc.title, content: doc.content, updatedAt: doc.updatedAt });
  });

  socket.on('disconnect', () => {
    if (socket.data.documentId) socket.to(`document:${socket.data.documentId}`).emit('presence', { userName: socket.data.userName, action: 'left' });
  });
});

mongoose.connect(MONGO_URI).then(() => {
  server.listen(PORT, () => console.log(`Collaborative editor running at http://localhost:${PORT}`));
}).catch((error) => {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
});
