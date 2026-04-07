# Women Safety Admin Dashboard - Quick Start Guide

## 🚀 Installation & Setup

### Step 1: Install Dependencies
Navigate to the admin folder and install all required packages:

```bash
cd admin
npm install
```

### Step 2: Configure Backend URL (Optional)
Edit `.env` file to set your backend URL (defaults to http://192.168.0.122:3000):

```bash
cp .env.example .env
# Edit .env as needed
```

### Step 3: Start Development Server
```bash
npm run dev
```

The dashboard will be available at: **http://localhost:5173**

---

## 📋 Features Overview

### 1. **Login Page** 🔐
- Secure admin authentication
- Email and password fields
- JWT token-based session management
- Auto-redirects to dashboard if already logged in

### 2. **Dashboard** 📊
Real-time SOS monitoring with:
- **Active SOS List** (Left Panel)
  - Search by SOS ID or phone number
  - Filter by status (Active/Assigned/Resolved)
  - Sort by newest/oldest
  - Live status badges

- **Interactive Map** (Center)
  - Real-time marker positions
  - Color-coded SOS markers
  - Tracking path visualization
  - Click markers for quick info
  - Auto-fit bounds to all alerts

- **Details Panel** (Right)
  - Full SOS information
  - Location with lat/long
  - User profile details
  - Assign Police/Ambulance buttons
  - Resolve SOS button

- **Analytics Dashboard** (Top)
  - Total SOS count
  - Active SOS count (with pulse animation)
  - Resolved SOS count
  - Manual refresh button

### 3. **History Page** 📋
- View all resolved incidents
- Search and filter by date
- Export to CSV
- Detailed incident view
- Timestamps and responder info

---

## 🎮 Using the Dashboard

### Assign a Responder
1. Select an active SOS from the list
2. Click **"Police"** or **"Ambulance"** in the Details Panel
3. Confirm the assignment
4. System generates responder ID automatically

### Resolve an SOS
1. Select the SOS alert
2. Click **"Resolve SOS"** button
3. SOS moves to History page
4. Status updates to "Resolved"

### Search and Filter
1. Use search box to find specific SOS
2. Filter by status dropdown
3. Sort by date (newest/oldest)

### View Tracking Path
1. Select an SOS alert
2. Map automatically shows tracking polyline
3. Blue dashed line shows movement path
4. View all location history points

---

## 🔧 Development

### Project Structure
```
admin/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components (Dashboard, Login, History)
│   ├── context/            # React Context (Authentication)
│   ├── services/           # API service layer
│   ├── App.jsx             # Main app routing
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Vite config
└── tailwind.config.js      # Tailwind CSS config
```

### Available Commands
```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Lint code (if configured)
```

### Environment Variables
```bash
VITE_API_URL     # Backend API URL (default: http://192.168.0.122:3000)
VITE_APP_NAME    # App name for browser title
```

---

## 🌐 Backend API Integration

The dashboard uses these API endpoints:

```javascript
POST   /api/admin/login            // Admin authentication
GET    /api/active-sos              // Active SOS list
GET    /api/tracking/:sosId         // Tracking history
GET    /api/latest                  // Latest location
PUT    /api/sos/:sosId/resolve      // Resolve SOS
PUT    /api/sos/:sosId/assign       // Assign responder
GET    /health                      // Server health check
```

### Authentication
- Token is automatically attached to all requests
- Token stored in localStorage as `adminToken`
- Automatic logout if token is invalid (401 error)

---

## 🎨 Customization

### Change Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#ef4444',      // Red
      secondary: '#06b6d4',    // Cyan
    }
  }
}
```

### Change Auto-refresh Rate
Edit `src/pages/Dashboard.jsx`:
```javascript
// Change 3000 to desired interval in milliseconds
const interval = setInterval(() => {
  fetchActiveSOS();
}, 3000);
```

### Change Map Tiles
Edit `src/components/MapView.jsx`:
```javascript
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  // Change to another provider like Mapbox, Satellite tiles, etc.
/>
```

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- ✓ Check backend is running at http://192.168.0.122:3000
- ✓ Verify network connectivity
- ✓ Check browser console for CORS errors
- ✓ Check backend logs for errors

### "No SOS markers on map"
- ✓ Create some SOS alerts from mobile app
- ✓ Click "Refresh" button
- ✓ Check database connection
- ✓ Verify API responses in Network tab

### "Login keeps redirecting to /login"
- ✓ Check email and password are correct
- ✓ Verify backend admin endpoint is working
- ✓ Check localStorage for token: Open DevTools → Application → LocalStorage
- ✓ Check browser console for API errors

### "Map not showing tiles"
- ✓ Check internet connection
- ✓ Clear browser cache (Ctrl+Shift+Delete)
- ✓ Check OpenStreetMap is not blocked
- ✓ Try different map provider in MapView.jsx

---

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- ✓ Desktop (1920x1080 and below)
- ✓ Tablet (iPad 768px+)
- ✓ Mobile (375px+) - Limited functionality

Sidebar collapses on mobile for better UX.

---

## 🔒 Security

- ✓ JWT-based authentication
- ✓ Secure token storage (localStorage)
- ✓ Protected routes (only authenticated users)
- ✓ Automatic logout on 401
- ✓ HTTPS ready (in production)

---

## 📊 Real-time Updates

The dashboard automatically refreshes every 3 seconds to:
- Fetch new SOS alerts
- Update SOS statuses
- Check for resolved incidents
- Refresh active count

Visual indicators:
- 🔴 **Red pulsing dot** = Active SOS
- 🟡 **Yellow** = Assigned responder
- ✅ **Green** = Resolved
- 🟦 **Blue** = Selected SOS (on map)

---

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized `dist/` folder.

### Deploy to Server
```bash
# Upload dist folder to your server
# Configure backend URL in .env
# Serve with nginx, Apache, or any static server
```

### Nginx Example
```nginx
server {
    listen 80;
    server_name admin.example.com;
    
    root /var/www/admin/dist;
    index index.html;
    
    location / {
        try_files $uri /index.html;
    }
}
```

---

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review browser console (F12)
3. Check backend logs
4. Contact development team

---

## 📄 Version
Women Safety Admin Dashboard v1.0
© 2024 All rights reserved
