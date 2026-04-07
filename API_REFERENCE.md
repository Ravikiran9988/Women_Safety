# Women Safety System — Complete API Reference

**Base URL:** `http://<your-lan-ip>:3000`

---

## 📊 Authentication Endpoints

### 1. Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com"
  }
}
```

### 2. Get Admin Profile (Protected)
```http
GET /api/admin/profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "ok": true,
  "admin": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "admin@example.com",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

---

## 🚨 SOS Management

### 1. Create SOS (Mobile App)
```http
POST /api/sos
Content-Type: application/json

{
  "type": "sos",
  "mode": "user",
  "profile": {
    "name": "Jane Doe",
    "phone": "+919876543210"
  },
  "location": {
    "latitude": 28.6339,
    "longitude": 77.2197,
    "accuracyMeters": 15
  }
}
```

**Response (201):**
```json
{
  "ok": true,
  "sosId": "60d69c9da3e00a001f8c0001",
  "message": "SOS alert created successfully"
}
```

### 2. Get Active SOS (Admin Dashboard)
```http
GET /api/active-sos
Accept: application/json
```

**Response (200):**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "60d69c9da3e00a001f8c0001",
      "id": "60d69c9da3e00a001f8c0001",
      "mode": "user",
      "status": "active",
      "profile": {
        "name": "Jane Doe",
        "phone": "+919876543210",
        "phoneNumber": "+919876543210"
      },
      "initialLocation": {
        "latitude": 28.6339,
        "longitude": 77.2197,
        "accuracy": 15
      },
      "lastLocation": null,
      "assignedResponder": null,
      "assignedTime": null,
      "resolvedAt": null,
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ],
  "count": 1
}
```

### 3. Assign Responder
```http
PUT /api/sos/<sosId>/assign
Content-Type: application/json
Authorization: Bearer <token>

{
  "responderType": "police",
  "responderName": "Police Unit-42"
}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Responder assigned successfully",
  "sos": {
    "_id": "60d69c9da3e00a001f8c0001",
    "status": "assigned",
    "assignedResponder": "Police Unit-42",
    "assignedTime": "2025-01-01T12:05:30Z"
  }
}
```

### 4. Resolve SOS
```http
PUT /api/sos/<sosId>/resolve
Content-Type: application/json

{}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "SOS marked as resolved",
  "sos": {
    "id": "60d69c9da3e00a001f8c0001",
    "status": "resolved",
    "resolvedAt": "2025-01-01T12:10:00Z"
  }
}
```

### 5. Get SOS by ID
```http
GET /api/sos/<sosId>
Accept: application/json
```

**Response (200):**
```json
{
  "ok": true,
  "sos": {
    "_id": "60d69c9da3e00a001f8c0001",
    "mode": "user",
    "status": "resolved",
    "profile": { "name": "Jane", "phone": "+919876543210", "phoneNumber": "+919876543210" },
    "initialLocation": { "latitude": 28.6339, "longitude": 77.2197, "accuracy": 15 },
    "lastLocation": { "latitude": 28.6350, "longitude": 77.2200, "accuracy": 12, "timestamp": "2025-01-01T12:09:00Z" },
    "createdAt": "2025-01-01T12:00:00Z",
    "updatedAt": "2025-01-01T12:10:00Z"
  }
}
```

---

## 📍 Tracking Data

### 1. Send Tracking Update (Mobile Background Task)
```http
POST /api/sos
Content-Type: application/json

{
  "type": "tracking",
  "sosId": "60d69c9da3e00a001f8c0001",
  "timestamp": "2025-01-01T12:01:30Z",
  "location": {
    "latitude": 28.6340,
    "longitude": 77.2200,
    "accuracyMeters": 12
  },
  "profile": {
    "name": "Jane Doe",
    "phone": "+919876543210"
  },
  "mode": "user"
}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Tracking update saved",
  "trackingId": "60d69c9da3e00a001f8c0002"
}
```

### 2. Get Tracking by SOS ID
```http
GET /api/tracking/<sosId>
Accept: application/json
```

**Response (200):**
```json
{
  "ok": true,
  "sosId": "60d69c9da3e00a001f8c0001",
  "data": [
    {
      "latitude": 28.6339,
      "longitude": 77.2197,
      "accuracy": 15,
      "timestamp": "2025-01-01T12:00:30Z"
    },
    {
      "latitude": 28.6340,
      "longitude": 77.2200,
      "accuracy": 12,
      "timestamp": "2025-01-01T12:01:30Z"
    }
  ],
  "count": 2,
  "sos": {
    "mode": "user",
    "status": "resolved",
    "createdAt": "2025-01-01T12:00:00Z"
  }
}
```

### 3. Get Latest Tracking Point
```http
GET /api/latest?sosId=<sosId>
Accept: application/json
```

**Response (200):**
```json
{
  "ok": true,
  "data": {
    "sosId": "60d69c9da3e00a001f8c0001",
    "location": {
      "latitude": 28.6350,
      "longitude": 77.2205,
      "accuracy": 10
    },
    "timestamp": "2025-01-01T12:09:00Z",
    "sos": {
      "mode": "user",
      "status": "resolved",
      "profile": { "name": "Jane Doe", "phone": "+919876543210" }
    }
  }
}
```

### 4. Get Tracking Summary (All Active SOS)
```http
GET /api/tracking/summary
Accept: application/json
```

**Response (200):**
```json
{
  "ok": true,
  "data": [
    {
      "sosId": "60d69c9da3e00a001f8c0001",
      "mode": "user",
      "profile": { "name": "Jane", "phone": "+919876543210" },
      "initialLocation": { "latitude": 28.6339, "longitude": 77.2197 },
      "latestTracking": {
        "location": { "latitude": 28.6350, "longitude": 77.2205 },
        "timestamp": "2025-01-01T12:09:00Z"
      },
      "createdAt": "2025-01-01T12:00:00Z"
    }
  ],
  "count": 1
}
```

---

## 🏥 Health & System

### 1. Health Check
```http
GET /health
Accept: application/json
```

**Response (200):**
```json
{
  "ok": true,
  "timestamp": "2025-01-01T12:15:00Z",
  "uptimeSeconds": 3600,
  "mongodb": "connected",
  "version": "2.0.0",
  "environment": "development"
}
```

### 2. Test Endpoint
```http
GET /api/test
Accept: application/json
```

**Response (200):**
```json
{
  "ok": true,
  "message": "SOS API Server is running",
  "timestamp": "2025-01-01T12:15:00Z",
  "version": "2.0.0"
}
```

### 3. Admin Test Endpoint
```http
GET /api/admin/test
Accept: application/json
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Admin routes are working"
}
```

---

## 🔍 Error Responses

All endpoints return error responses in this format:

```json
{
  "ok": false,
  "error": "Error message describing what went wrong"
}
```

### Common Status Codes:

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | GET request successful |
| 201 | Created | SOS created successfully |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid token or not logged in |
| 404 | Not Found | SOS ID does not exist |
| 500 | Server Error | Database connection failed |

### Common Errors:

```json
{
  "ok": false,
  "error": "Mode and location (latitude, longitude) are required"
}
```

```json
{
  "ok": false,
  "error": "Invalid SOS ID"
}
```

```json
{
  "ok": false,
  "error": "Authorization token required"
}
```

```json
{
  "ok": false,
  "error": "Cannot track resolved SOS"
}
```

---

## 📱 Request Headers

All requests should include:

```
Content-Type: application/json
Accept: application/json
```

For protected endpoints, also include:

```
Authorization: Bearer <jwt-token>
```

---

## 🔄 Request/Response Examples

### Complete SOS Workflow

**1. Admin Login**
```bash
curl -X POST http://192.168.0.122:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

**2. Mobile App Sends SOS**
```bash
curl -X POST http://192.168.0.122:3000/api/sos \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sos",
    "mode": "user",
    "profile": {"name": "Jane", "phone": "+919876543210"},
    "location": {"latitude": 28.6339, "longitude": 77.2197, "accuracyMeters": 15}
  }'
```

**3. Admin Gets Active SOS**
```bash
curl -X GET http://192.168.0.122:3000/api/active-sos
```

**4. Admin Assigns Responder**
```bash
curl -X PUT http://192.168.0.122:3000/api/sos/<sosId>/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"responderType": "police", "responderName": "Unit-01"}'
```

**5. Admin Resolves SOS**
```bash
curl -X PUT http://192.168.0.122:3000/api/sos/<sosId>/resolve \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## ⏱️ Rate Limits

Currently no rate limiting. For production, add:
- 100 requests per minute per IP for `/api/sos`
- 10 requests per minute per IP for `/api/admin/login`

---

## 📡 Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/women-safety
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://192.168.0.122:5173
NODE_ENV=development
JWT_SECRET=your-secret-key-here
```

---

## 🔐 Authentication

- JWT tokens are valid for 24 hours
- Token must be included in `Authorization: Bearer` header for protected routes
- On token expiration, client receives 401 and should ask user to login again

---

## 📊 Data Models

### SOS Document
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Nullable for guests
  mode: "guest" | "user",
  status: "active" | "resolved" | "assigned",
  profile: {
    name: String,
    phone: String
  },
  initialLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  lastLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: Date
  },
  assignedResponder: String,  // e.g., "Police Unit-42"
  assignedTime: Date,
  resolvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Tracking Document
```javascript
{
  _id: ObjectId,
  sosId: ObjectId,            // Reference to SOS
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  timestamp: Date,
  createdAt: Date
}
```

---

## ✨ Tips for Integration

1. **Always check `response.ok`** before accessing `response.data`
2. **Include error messages** in UI for user feedback
3. **Use sosId for tracking** — sent in SOS create response
4. **Store JWT token securely** — localStorage for web, SecureStorage for mobile
5. **Handle 401 responses** — redirect to login
6. **Test with curl first** — before integrating into UI
7. **Monitor logs** — server and browser console logs tell you everything

---

## 🧪 Quick Curl Test Suite

```bash
# Health check
curl http://192.168.0.122:3000/health | jq

# Test endpoint
curl http://192.168.0.122:3000/api/test | jq

# Admin login
TOKEN=$(curl -s -X POST http://192.168.0.122:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}' | jq -r '.token')

# Get active SOS
curl http://192.168.0.122:3000/api/active-sos | jq

# Create test SOS
SOS_ID=$(curl -s -X POST http://192.168.0.122:3000/api/sos \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sos",
    "mode": "user",
    "profile": {"name": "Test", "phone": "+919876543210"},
    "location": {"latitude": 28.6339, "longitude": 77.2197, "accuracyMeters": 15}
  }' | jq -r '.sosId')

# Get that SOS
curl http://192.168.0.122:3000/api/sos/$SOS_ID | jq

# Get tracking for that SOS
curl http://192.168.0.122:3000/api/tracking/$SOS_ID | jq

# Assign responder
curl -X PUT http://192.168.0.122:3000/api/sos/$SOS_ID/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"responderType": "police", "responderName": "Unit-01"}' | jq

# Resolve SOS
curl -X PUT http://192.168.0.122:3000/api/sos/$SOS_ID/resolve \
  -H "Content-Type: application/json" \
  -d '{}' | jq
```

---

## 📞 Support

Check the [BUG_REPORT_AND_FIXES.md](./BUG_REPORT_AND_FIXES.md) and [DEBUG_AND_TEST_GUIDE.md](./DEBUG_AND_TEST_GUIDE.md) for troubleshooting.
