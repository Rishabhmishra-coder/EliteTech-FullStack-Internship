const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3004;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/elitech_productivity';

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const sessionSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  hostname: { type: String, index: true },
  category: { type: String, enum: ['productive','unproductive','neutral'], default: 'neutral' },
  seconds: { type: Number, min: 0 },
  startedAt: { type: Date, default: Date.now },
  date: { type: String, index: true }
}, { timestamps: true });
const Session = mongoose.model('Session', sessionSchema);

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/time-sessions', async (req, res) => {
  const { userId, hostname, category, seconds, startedAt } = req.body || {};
  if (!hostname || !Number.isFinite(seconds) || seconds <= 0) return res.status(400).json({ error: 'hostname and positive seconds are required' });
  const safeSeconds = Math.min(Math.round(seconds), 3600);
  const when = startedAt ? new Date(startedAt) : new Date();
  const date = when.toISOString().slice(0, 10);
  const session = await Session.create({ userId: String(userId || 'anonymous').slice(0, 100), hostname: String(hostname).slice(0, 255), category: ['productive','unproductive','neutral'].includes(category) ? category : 'neutral', seconds: safeSeconds, startedAt: when, date });
  res.status(201).json({ id: session._id });
});

app.get('/api/analytics', async (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 7, 1), 31);
  const userId = String(req.query.userId || 'anonymous').slice(0, 100);
  const from = new Date(Date.now() - days * 86400000);
  const rows = await Session.aggregate([
    { $match: { userId, startedAt: { $gte: from } } },
    { $group: { _id: { hostname: '$hostname', category: '$category' }, seconds: { $sum: '$seconds' } } },
    { $sort: { seconds: -1 } }
  ]);
  const daily = await Session.aggregate([
    { $match: { userId, startedAt: { $gte: from } } },
    { $group: { _id: { date: '$date', category: '$category' }, seconds: { $sum: '$seconds' } } },
    { $sort: { '_id.date': 1 } }
  ]);
  const total = rows.reduce((sum, r) => sum + r.seconds, 0);
  const productive = rows.filter(r => r._id.category === 'productive').reduce((sum,r)=>sum+r.seconds,0);
  res.json({ totalSeconds: total, productiveSeconds: productive, productivityRate: total ? Math.round(productive/total*100) : 0, sites: rows.map(r => ({ hostname:r._id.hostname, category:r._id.category, seconds:r.seconds })), daily: daily.map(r => ({ date:r._id.date, category:r._id.category, seconds:r.seconds })) });
});

mongoose.connect(MONGO_URI).then(() => app.listen(PORT, () => console.log(`Productivity dashboard running at http://localhost:${PORT}`))).catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
