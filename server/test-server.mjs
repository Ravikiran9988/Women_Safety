/**
 * Simple test server for development without MongoDB
 * Run: node server/test-server.mjs
 */
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001; // Different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for testing
let mockUsers = [];
let mockSOS = [];
let mockTracking = [];

// Health check
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    mongodb: 'test-mode',
    version: '2.0.0-test',
    environment: 'test'
  });
});

// Mock user endpoints
app.post('/api/users', (req, res) => {
  const { name, phone } = req.body;
  const user = {
    _id: Date.now().toString(),
    name,
    phone,
    createdAt: new Date()
  };
  mockUsers.push(user);
  res.json({ ok: true, user });
});

app.get('/api/users/:id', (req, res) => {
  const user = mockUsers.find(u => u._id === req.params.id);
  if (!user) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }
  res.json({ ok: true, user });
});

// Mock SOS endpoints
app.post('/api/sos', (req, res) => {
  const { mode, profile, initialLocation } = req.body;
  const sos = {
    _id: Date.now().toString(),
    mode,
    profile,
    status: 'active',
    initialLocation,
    createdAt: new Date()
  };
  mockSOS.push(sos);
  res.json({ ok: true, sosId: sos._id, message: 'SOS created' });
});

app.get('/api/sos/active', (req, res) => {
  const active = mockSOS.filter(s => s.status === 'active');
  res.json({ ok: true, data: active, count: active.length });
});

app.put('/api/sos/:id/resolve', (req, res) => {
  const sos = mockSOS.find(s => s._id === req.params.id);
  if (!sos) {
    return res.status(404).json({ ok: false, error: 'SOS not found' });
  }
  sos.status = 'resolved';
  res.json({ ok: true, message: 'SOS resolved' });
});

// Mock tracking endpoints
app.post('/api/tracking', (req, res) => {
  const { sosId, location, timestamp } = req.body;
  const tracking = {
    _id: Date.now().toString(),
    sosId,
    location,
    timestamp: timestamp || new Date()
  };
  mockTracking.push(tracking);
  res.json({ ok: true, message: 'Tracking saved', trackingId: tracking._id });
});

app.get('/api/tracking/sos/:sosId', (req, res) => {
  const tracking = mockTracking.filter(t => t.sosId === req.params.sosId);
  res.json({ ok: true, data: tracking, count: tracking.length });
});

app.get('/api/tracking/latest', (req, res) => {
  if (mockTracking.length === 0) {
    return res.json({ ok: true, data: null });
  }
  const latest = mockTracking[mockTracking.length - 1];
  res.json({ ok: true, data: latest });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🧪 Test Server running on http://0.0.0.0:${PORT}`);
  console.log(`📍 Test endpoints available (no MongoDB required)`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /api/users - Create user`);
  console.log(`   GET  /api/users/:id - Get user`);
  console.log(`   POST /api/sos - Create SOS`);
  console.log(`   GET  /api/sos/active - Active SOS`);
  console.log(`   PUT  /api/sos/:id/resolve - Resolve SOS`);
  console.log(`   POST /api/tracking - Save tracking`);
  console.log(`   GET  /api/tracking/sos/:sosId - Get tracking`);
  console.log(`   GET  /api/tracking/latest - Latest tracking`);
});