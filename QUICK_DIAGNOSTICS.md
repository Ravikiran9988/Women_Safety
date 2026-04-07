# Women Safety System — Quick Diagnostics Card

|  Print this and keep it handy during testing! 

---

## 🚨 QUICK DIAGNOSTICS

### Is the Backend Running?
```bash
curl http://192.168.0.122:3000/health
```
Should return: `"ok": true` ✅

**If not:**
- ❌ Server not started → `node server/server.mjs`
- ❌ Wrong IP → check `ipconfig | findstr IPv4`
- ❌ Port 3000 busy → change PORT in .env

---

### Is MongoDB Connected?
```bash
# In backend logs, look for:
✅ MongoDB connected to Atlas successfully
```

**If error:**
- ❌ MONGODB_URI missing → add to .env
- ❌ Connection string wrong → verify in MongoDB Atlas
- ❌ No internet → check WiFi

---

### Is Admin Dashboard Connecting?
**In browser DevTools Console, should show:**
```
🧭 Admin API base URL: http://192.168.0.122:3000
```

**If error:**
- ❌ No messages → refresh page
- ❌ CORS error → backend not giving permission
- ❌ Network tab shows 0 bytes → firewall blocking
- ❌ Wrong URL → check VITE_API_URL in admin/.env

---

### Is Mobile App Reaching Backend?
**In Expo console, after SOS trigger:**
```
🚨 SOS API response: 201 {"ok": true, "sosId": "..."}
```

**If error:**
- ❌ Network timeout → backend down or unreachable
- ❌ 403 CORS error → CORS_ORIGINS missing this IP
- ❌ 400 Bad Request → payload format wrong
- ❌ API URL still says localhost → .env not reloaded

---

## 🧪 QUICK TEST SEQUENCE

### Step 1: Start Services
```
Terminal 1: node server/server.mjs
Terminal 2: cd admin && npm run dev
Terminal 3: npx expo start
```

**Wait for all to say "Ready":**
- Backend: `🚀 SOS API Server listening on 0.0.0.0:3000`
- Admin: `➜ Local: http://localhost:5173`
- Expo: `Expo URL: exp://192.168.0.122:...`

### Step 2: Test One SOS
1. Open admin at `http://192.168.0.122:5173`
2. Login
3. Press SOS button on mobile for 2 seconds
4. Check backend logs for `🚨 SOS created`
5. Dashboard should show SOS within 3 seconds

### Step 3: Test Assign
1. Click SOS in admin dashboard
2. Click "Police" button in Details panel
3. Should show "Assigned" status
4. Backend should log `👮 SOS assigned`

### Step 4: Test Resolve
1. Click "Resolve SOS" button
2. Should show "Resolved" status
3. SOS should hide from dashboard

---

## ❌ COMMON ERRORS & FIXES

| Error | Cause | Fix |
|-------|-------|-----|
| `CORS policy blocked...` | Wrong CORS_ORIGINS | Update `CORS_ORIGINS=http://192.168.0.122:...` in server/.env |
| `Cannot GET /api/active-sos` | Wrong base URL | Check admin VITE_API_URL matches `192.168.0.122:3000` |
| `Failed to fetch SOS alerts` | Network unreachable | Verify both on same WiFi + firewall allows port 3000 |
| Map not showing markers | Leaflet CSS missing | Check: imported `'leaflet/dist/leaflet.css'` in admin/src/main.jsx |
| SOS button never completes | API not responding | Check backend logs for `📨 POST /api/sos` |
| Infinite loading on dashboard | Polling loop issue | Restart admin dashboard with `npm run dev` |
| Admin actions don't persist | Route missing | Verify `PUT /:id/assign` route exists in server/routes/sosRoutes.mjs |
| Phone numbers showing as "N/A" | Profile field wrong | Backend should return `profile.phone` or `profile.phoneNumber` |

---

## 🔍 NETWORK CHECK

**On Any Device:**
```bash
# Test backend reachability
curl http://192.168.0.122:3000/health

# If fails:
#   - Check IP is correct: ipconfig | findstr IPv4
#   - Check backend running: see backend terminal
#   - Check firewall: try disabling temporarily
#   - Check WiFi: device on same network?
```

**From Mobile:**
```bash
# In mobile browser, open:
http://192.168.0.122:3000/health

# Should see JSON response
```

---

## 📊 LOGS TO WATCH

### Backend (Most Important)
```
✅ Expected:
📨 POST /api/sos                      # SOS received
🚨 SOS created: 60d69...              # SOS stored
📍 Tracking saved for SOS: 60d69...   # Tracking received
👮 SOS assigned: 60d69... Police...   # Assignment worked
✅ SOS resolved: 60d69...             # Resolved

❌ Errors:
❌ CORS denied for origin: ...
❌ MongoDB connection error
❌ Create SOS error
```

### Admin Dashboard Console (2nd Most Important)
```
✅ Expected:
🧭 Admin API base URL: http://192.168.0.122:3000
Network tab shows: GET /api/active-sos → 200
(no CORS errors)

❌ Errors:
blocked by CORS policy
TypeError: Cannot read property 'map'
Network shows 0 bytes response
```

### Mobile App Console (Expo)
```
✅ Expected:
API URL: http://192.168.0.122:3000/api/sos
🚨 SOS API response: 201 {...}
📝 SOS ID stored: 60d69...

❌ Errors:
Network timeout after 10000ms
JSON Parse error
location permission denied
```

---

## 🎚️ SETTINGS TO CHECK

### Backend .env
```env
PORT=3000                                              # ← Right port?
MONGODB_URI=mongodb+srv://...                         # ← Valid?
CORS_ORIGINS=...,http://192.168.0.122:...            # ← Includes admin IP?
NODE_ENV=development                                   # ← OK for testing
```

### Admin .env (admin/)
```env
VITE_API_URL=http://192.168.0.122:3000              # ← Correct IP:port?
VITE_APP_NAME=Women Safety Admin Dashboard
```

### Mobile .env (root)
```env
EXPO_PUBLIC_SOS_API_URL=http://192.168.0.122:3000/api/sos  # ← Correct?
EXPO_PUBLIC_SMS_RECIPIENTS=...                              # ← Valid?
```

---

## ⏱️ EXPECTED TIMINGS

| Action | Time |
|--------|------|
| Backend startup | 2-3 seconds |
| MongoDB connect | < 5 seconds |
| Admin page load | 1-2 seconds |
| SOS list fetch | 300-500 ms |
| Map render | 1-2 seconds |
| Polling interval | Exactly 3 seconds |
| Mobile SOS resolution | 2-5 seconds |
| Dashboard shows new SOS | 0-3 seconds (next poll) |

---

## 🆘 WHEN STUCK

1. **Check ALL 3 logs** (backend, admin console, expo)
2. **Restart the service** (sometimes fixes transient issues)
3. **Check network connectivity** (`ping 192.168.0.122`)
4. **Verify environment variables** (print them out)
5. **Try curl first** (eliminates UI issues)
6. **Read DEBUG_AND_TEST_GUIDE.md** (comprehensive guide)

---

## 📱 MOBILE DEVICE SETUP

### iOS (Simulator)
```
1. Have Expo CLI ready
2. Press 'i' in terminal
3. Simulator opens
4. App loads
```

### Android (Real Device)
```
1. Install Expo Go from Play Store
2. Connect to same WiFi
3. Scan QR code from terminal
4. App loads
5. Grant permissions when asked
```

### Android Emulator
```
1. Start Android Studio emulator
2. Run: npx expo start
3. Press 'a' in terminal
4. App loads in emulator
```

---

## ✅ MINIMAL WORKING TEST

**5-minute smoke test:**

```bash
# 1. Backend health
curl http://192.168.0.122:3000/health | jq .ok

# 2. Create test SOS
curl -X POST http://192.168.0.122:3000/api/sos \
  -H "Content-Type: application/json" \
  -d '{"type":"sos","mode":"user","profile":{"name":"Test","phone":"+919876543210"},"location":{"latitude":28.6,"longitude":77.2}}'

# 3. Get active SOS
curl http://192.168.0.122:3000/api/active-sos | jq '.data | length'

# 4. Should see 1 SOS in response
```

**If all 4 commands succeed:** ✅ Backend works
**If admin dashboard shows SOS:** ✅ Admin works
**If mobile SOS button triggers:** ✅ Mobile works

---

## 🎯 PRIORITY CHECKS (In Order)

1. ✅ Backend running? → Backend logs show startup messages
2. ✅ MongoDB connected? → Backend logs show "✅ MongoDB connected"
3. ✅ Can reach backend from PC? → `curl http://192.168.0.122:3000/health` returns 200
4. ✅ Admin login works? → Can access dashboard after login
5. ✅ Admin connects to backend? → Console shows correct API URL, no CORS errors
6. ✅ Mobile app starts? → Expo shows app on screen
7. ✅ SOS button works? → Triggers without errors
8. ✅ Backend receives SOS? → Logs show `🚨 SOS created`
9. ✅ Admin shows SOS? → Appears in dashboard within 3 seconds
10. ✅ Admin actions work? → Assign/resolve buttons functional

---

**Remember:**  
- **One issue at a time** — fix in priority order above
- **Check logs first** — they always tell the truth
- **Use curl to test** — before blaming the UI
- **Restart when stuck** — often fixes transient issues
- **Ask the system** — logs are your best friend 🔍

Good luck! 🚀
