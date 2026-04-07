# Women Safety System — End-to-End Debug & Test Guide

This guide covers testing the complete system: mobile app, backend, and admin dashboard.

---

## ⚙️ PREREQUISITES

### 1. Network Setup
- **Mobile device & PC must be on the same WiFi network**
- Find your PC's LAN IP:
  ```bash
  # Windows PowerShell
  ipconfig | findstr "IPv4"
  # Example: 192.168.0.122 or 192.168.1.10
  ```
- **Note this IP** — you'll use it for all API URLs

### 2. Environment Variables

**Root .env** (server):
```env
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/women-safety
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://192.168.0.122:5173,http://192.168.0.122:5174
NODE_ENV=development
```

**Admin .env** (admin/):
```env
VITE_API_URL=http://192.168.0.122:3000
VITE_APP_NAME=Women Safety Admin Dashboard
```

**Mobile .env** (root, Expo reads EXPO_PUBLIC_*):
```env
EXPO_PUBLIC_SOS_API_URL=http://192.168.0.122:3000/api/sos
EXPO_PUBLIC_SMS_RECIPIENTS=+15551234567,+15559876543
```

---

## 🚀 STEP 1: START THE BACKEND SERVER

### Terminal 1: Backend Server

```bash
cd women-safety-app
node server/server.mjs
```

**✅ Success indicators:**
```
🚀 SOS API Server v2.0.0 listening on http://0.0.0.0:3000
✅ MongoDB connected to Atlas successfully
🧩 CORS allowed origins: [...]
📋 Admin routes registered
📋 SOS routes registered
📋 Tracking routes registered
```

### 🔍 Quick Backend Health Check

**From mobile/desktop browser:**
```
http://<your-lan-ip>:3000/health
```

**Expected response (200):**
```json
{
  "ok": true,
  "mongodb": "connected",
  "version": "2.0.0"
}
```

---

## 🏥 STEP 2: TEST BACKEND ROUTES (Manual Testing)

Use **curl** or **Postman** to verify each route:

### 2.1 Create an Admin (One-time setup)
```bash
npm run create-admin
```
Output: Admin created with email/password

### 2.2 Admin Login
```bash
curl -X POST http://192.168.0.122:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```
**Expected:** `200` with `token` in response

### 2.3 Get Active SOS (Before any SOS)
```bash
curl -X GET http://192.168.0.122:3000/api/active-sos
```
**Expected:** `200` with `{"ok": true, "data": [], "count": 0}`

### 2.4 Create a Test SOS
```bash
curl -X POST http://192.168.0.122:3000/api/sos \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sos",
    "mode": "user",
    "profile": {
      "name": "Test User",
      "phone": "+919876543210"
    },
    "location": {
      "latitude": 28.6339,
      "longitude": 77.2197,
      "accuracyMeters": 15
    }
  }'
```
**Expected:** `201` with `{"ok": true, "sosId": "..."}`

### 2.5 Get Active SOS (After creating one)
```bash
curl -X GET http://192.168.0.122:3000/api/active-sos
```
**Expected:** `200` with active SOS in
 data array

### 2.6 Add Tracking to SOS
```bash
# Use sosId from step 2.4
curl -X POST http://192.168.0.122:3000/api/sos \
  -H "Content-Type: application/json" \
  -d '{
    "type": "tracking",
    "sosId": "<sosId>",
    "location": {
      "latitude": 28.6340,
      "longitude": 77.2200,
      "accuracyMeters": 12
    }
  }'
```
**Expected:** `200` with tracking saved

### 2.7 Get Tracking by SOS
```bash
curl -X GET http://192.168.0.122:3000/api/tracking/<sosId>
```
**Expected:** `200` with tracking points array

### 2.8 Assign Responder
```bash
curl -X PUT http://192.168.0.122:3000/api/sos/<sosId>/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "responderType": "police",
    "responderName": "Police Unit-01"
  }'
```
**Expected:** `200` with status "assigned"

### 2.9 Resolve SOS
```bash
curl -X PUT http://192.168.0.122:3000/api/sos/<sosId>/resolve \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Expected:** `200` with status "resolved"

---

## 🖥️ STEP 3: START ADMIN DASHBOARD

### Terminal 2: Admin Frontend

```bash
cd admin
npm install  # if needed
npm run dev
```

**✅ Success indicators:**
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.0.122:5173/
🧭 Admin API base URL: http://192.168.0.122:3000
```

**Access from browser:**
- Local: `http://localhost:5173`
- LAN: `http://192.168.0.122:5173`

### 3.1 Admin Login

1. Open `http://192.168.0.122:5173`
2. Login with admin credentials
3. ✅ Should redirect to Dashboard
4. Check **browser console** for API logs:
   ```
   🧭 Admin API base URL: http://192.168.0.122:3000
   📨 GET /api/active-sos
   ```

### 3.2 Dashboard Verification

- ✅ Stats cards show "Active SOS" count
- ✅ Map renders (default center: Delhi)
- ✅ SOS list is empty (no active alerts yet)
- ✅ "Refresh" button works

### 3.3 Create SOS from Backend, View in Dashboard

Using curl from step 2.4, create a test SOS. **Dashboard should:**
- 🔄 Auto-fetch within 3 seconds
- 📍 Show SOS on map
- 📝 List SOS in left sidebar
- 🔴 Display "Active" status

### 3.4 Test Admin Actions

#### Assign Responder
1. Click an SOS from the list
2. In Details Panel (right), click "Police" button
3. ✅ SOS status → "Assigned"
4. ✅ "Assigned Responder" field shows responder name

#### Resolve SOS
1. Click "Resolve SOS" button
2. ✅ Status → "Resolved" (green checkmark)
3. ✅ Moves to History page after refresh

#### Tracking & Map Visualization
1. Add tracking points using curl (step 2.6)
2. ✅ Map updates with new marker position
3. ✅ Blue dashed line shows tracking path

---

## 📱 STEP 4: TEST MOBILE APP

### Prerequisites for Expo

1. **Install Expo Go** on your device:
   - [iOS App Store](https://apps.apple.com/us/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Verify Environment Variables:**
   - Root `.env` includes: `EXPO_PUBLIC_SOS_API_URL=http://192.168.0.122:3000/api/sos`
   - Check values match your LAN IP

### Terminal 3: Expo App

```bash
cd women-safety-app
npx expo start
```

**✅ Success indicators:**
```
Registered Exponent using...
Expo URL: exp://192.168.0.122:8081
Metro waiting on exp://192.168.0.122:8081
```

### 4.1 Connect Mobile Device

**iOS (Simulator):**
```bash
# Press 'i' in terminal to open iOS simulator
```

**Android (Real Device or Emulator):**
1. Open **Expo Go** app
2. Tap "Scan QR code"
3. Scan QR from terminal
4. ✅ App loads

### 4.2 Verify Location Permissions

**On first launch:**
- App requests location permission
- ✅ Grant permission to continue
- ✅ "SafeCircle" home screen appears

### 4.3 Test SOS Button

1. Navigate to **SOS Screen**
2. Read on-screen instruction: "Press and hold for 2 seconds"
3. **Press and hold** the red SOS button for 2 seconds
4. 🔄 Loading overlay: "Getting location, contacting server, SMS…"

**✅ Expected events (in Console):**
```
🚀 Sending SOS...
🚨 Sending SOS payload: {...}
📍 Location captured: 28.634, 77.220
🚨 SOS API response: 201 {"ok": true, "sosId": "..."}
📝 SOS ID stored: <sosId>
```

### 4.4 Verify Backend Received SOS

```bash
curl -X GET http://192.168.0.122:3000/api/active-sos
```
**Expected:** New SOS in response array

### 4.5 SMS Verification

After SOS is triggered:
1. SMS composer should open (if SMS available)
2. Recipients: emergency contacts + EXPO_PUBLIC_SMS_RECIPIENTS
3. ✅ Message includes location map link

### 4.6 Background Tracking

After successful SOS:
1. **Keep app running in background** (lock screen or minimize)
2. Change your physical location (walk/drive)
3. Every 5-10 seconds, location updates sent to server
4. ✅ Backend logs show: `📍 Tracking saved for SOS: <sosId>`

### 4.7 Admin Dashboard Live Sync

While tracking is active:
1. Keep admin dashboard open
2. 🗺️ Map should show updated marker positions
3. 📌 Blue dashed line extends with new tracking points
4. 🔄 Updates every 3 seconds (polling)

---

## 🐛 DEBUGGING COMMON ISSUES

### Issue: Admin Dashboard Shows "Failed to fetch SOS alerts"

**Check:**
1. Backend running? `http://192.168.0.122:3000/health`
2. CORS configured correctly? Check server logs:
   ```
   🧩 CORS allowed origins: [...]
   ```
3. API URL correct? Check browser console:
   ```
   🧭 Admin API base URL: http://192.168.0.122:3000
   ```
4. MongoDB connected? Check server startup logs

**Fix:**
```bash
# Kill and restart backend with logs
node server/server.mjs 2>&1 | tee server.log
```

### Issue: Mobile App SOS Button Always Shows "Loading"

**Check:**
1. API URL set correctly:
   ```
   API URL: http://192.168.0.122:3000/api/sos
   ```
   (Should print in console at app startup)
2. Location permission granted?
3. Backend reachable from mobile?
   ```
   # From mobile browser: http://192.168.0.122:3000/health
   ```
4. CORS enabled? Check backend logs

**Fix:**
```bash
# Verify API URL at startup
console.log("API URL:", process.env.EXPO_PUBLIC_SOS_API_URL);
```

### Issue: Map Not Showing SOS Markers

**Check:**
1. SOS created with `initialLocation`?
2. Latitude/longitude valid? (Delhi: 28.6, 77.2)
3. Leaflet CSS loaded? Check browser DevTools:
   ```
   Network tab → leaflet.css should load
   ```

**Fix:**
```bash
# Ensure leaflet CSS imported in admin/src/main.jsx
import 'leaflet/dist/leaflet.css'
```

### Issue: Tracking Updates Not Syncing

**Check:**
1. Background location permission granted on mobile? (iOS needs "Always Allow")
2. SOS API URL correct for background task?
3. App not closed immediately after SOS?

**Fix (on mobile):**
- iOS: Settings → [App] → Location → "Always"
- Android: Settings → Permissions → Location → "Allow all the time"

### Issue: CORS Errors in Admin Dashboard

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Check:**
1. Allowed origins in backend `.env`:
   ```env
   CORS_ORIGINS=http://localhost:5173,http://192.168.0.122:5173
   ```
2. Server restarted after `.env` change?
3. Using exact origin (protocol + host + port)

**Fix:**
```bash
# Add LAN IP to CORS_ORIGINS and restart
CORS_ORIGINS=http://localhost:5173,http://192.168.0.122:5173,http://192.168.0.122:5174
node server/server.mjs
```

---

## ✅ FULL WORKFLOW TEST CHECKLIST

- [ ] Backend starts and connects to MongoDB
- [ ] `/health` endpoint returns 200
- [ ] Admin login succeeds
- [ ] Admin dashboard loads without CORS errors
- [ ] Mobile app starts and requests permissions
- [ ] SOS button triggers without errors
- [ ] Backend receives SOS POST request
- [ ] Admin dashboard shows new SOS within 3 seconds
- [ ] SOS appears on map
- [ ] Background tracking sends location updates
- [ ] Admin can assign responder (police/ambulance)
- [ ] Admin can resolve SOS
- [ ] SOS moves to History after resolve
- [ ] Resolved SOS no longer shows as "Active"

---

## 📊 MONITORING & LOGGING

### Backend Logs
Watch for these indicators:

✅ **Good:**
```
📨 POST /api/sos
🚨 SOS created: <id> Mode: user
📍 Tracking saved for SOS: <id>
👮 SOS assigned: <id> Police Unit-01
✅ SOS resolved: <id>
```

❌ **Problems:**
```
⚠️ CORS denied for origin: http://wrong-ip:5173
❌ MongoDB connection error: ...
❌ Create SOS error: ...
```

### Browser Console (Admin)
**Network tab:**
- All requests to `http://192.168.0.122:3000/api/*` should return 200/201

**Console tab:**
- Should NOT see CORS errors
- Should see: `🧭 Admin API base URL: http://192.168.0.122:3000`

### Mobile App Logs (Expo)
**Press 'j' in Expo terminal to open debugger:**
- Should see `🚨 SOS API response: 201 {...}`
- Should NOT see network timeout errors

---

## 🔒 SECURITY NOTES FOR PRODUCTION

1. ❌ **Never** use hardcoded IPs in CORS
   - Use environment variables
   - Validate against whitelist

2. ❌ **Never** commit `.env` files
   - Use `.env.example` as template
   - Store secrets in CI/CD or vault

3. JWT tokens:
   - Change `JWT_SECRET` in production
   - Use strong admin passwords
   - Rotate tokens regularly

4. HTTPS:
   - Use HTTPS in production (not HTTP)
   - Get SSL certificate (Let's Encrypt)

---

## 📋 TEST CASE SCENARIOS

### Scenario 1: Single User SOS

1. User triggers SOS from mobile
2. Admin receives alert on dashboard
3. Admin assigns police unit
4. Admin resolves incident
5. **Expected:** Complete workflow without errors

### Scenario 2: Multiple Concurrent SOS

1. Trigger 3 SOS from different sources (curl)
2. Admin dashboard shows all 3
3. Admin resolves one, assigns another
4. **Expected:** All operations succeed independently

### Scenario 3: No Internet

1. Disable WiFi on mobile during SOS
2. SOS button should show error
3. Re-enable WiFi, try again
4. **Expected:** Works after network restored

### Scenario 4: Server Down

1. Stop backend server
2. Admin dashboard shows "Failed to fetch"
3. Start backend
4. Dashboard auto-recovery within 3 seconds
5. **Expected:** Graceful error handling

---

## 🚀 NEXT STEPS

1. ✅ Run through all steps above
2. ✅ Document any issues
3. ✅ Fix bugs with provided logs
4. ✅ Deploy to production with HTTPS
5. ✅ Set up monitoring (error tracking, uptime)

**Questions?** Check logs first — they tell you everything! 📊
