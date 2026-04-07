# Women Safety Admin Dashboard

A modern, real-time React admin dashboard for managing women safety SOS tracking system.

## Features

✅ **Real-time SOS Tracking** - Live map with active emergency alerts
✅ **Multi-user Support** - Track multiple simultaneous SOS incidents  
✅ **Admin Authentication** - Secure JWT-based login system
✅ **Interactive Map** - React Leaflet integration with markers and tracking paths
✅ **SOS Management** - Assign responders and resolve incidents
✅ **History & Analytics** - View completed incidents with detailed reports
✅ **Responsive Design** - Works on desktop and tablets
✅ **Real-time Updates** - Auto-refresh every 3 seconds

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Backend API running at `http://192.168.0.122:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The dashboard will open at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
admin/
├── src/
│   ├── components/
│   │   ├── MapView.jsx           # Interactive map with markers
│   │   ├── SOSList.jsx           # Active SOS alerts list
│   │   ├── DetailsPanel.jsx      # Selected SOS details
│   │   └── Sidebar.jsx           # Navigation sidebar
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx         # Main dashboard page
│   │   ├── Login.jsx             # Admin login page
│   │   └── History.jsx           # Resolved incidents history
│   │
│   ├── context/
│   │   └── AuthContext.jsx       # Authentication context
│   │
│   ├── services/
│   │   └── api.js                # API service layer
│   │
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
│
├── public/                       # Static assets
├── index.html                    # HTML entry point
├── package.json                  # Dependencies
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
└── postcss.config.js            # PostCSS config
```

## API Endpoints Used

The dashboard connects to these backend API endpoints:

- `POST /api/admin/login` - Admin authentication
- `GET /api/active-sos` - Fetch active SOS alerts
- `GET /api/tracking/:sosId` - Get tracking history for SOS
- `GET /api/latest` - Get latest location
- `PUT /api/sos/:sosId/resolve` - Mark SOS as resolved
- `PUT /api/sos/:sosId/assign` - Assign responder to SOS

## Dashboard Features

### 1. Login Page
- Email and password authentication
- Secure JWT token storage
- Session persistence

### 2. Dashboard Page
- **SOS List**: Search, filter, and sort active alerts
- **Interactive Map**: Real-time marker positions and tracking paths
- **Details Panel**: View full SOS information and assign responders
- **Analytics**: Total, active, and resolved SOS counts
- **Real-time Updates**: Auto-refresh every 3 seconds
- **Notifications**: Alert when new SOS arrives

### 3. Assign Responders
- Assign Police units
- Assign Ambulances
- Auto-generated responder IDs

### 4. Resolve SOS
- Mark incidents as complete
- Automatic list update
- Move to history

### 5. History Page
- View all resolved incidents
- Search and date filtering
- Export to CSV
- View detailed incident information

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **React Leaflet** - Interactive maps
- **Axios** - HTTP client
- **Lucide React** - Icons

## Configuration

### Backend URL

To change the backend API URL, update `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.168.0.122:3000';
```

Or set environment variable:
```bash
VITE_API_URL=http://your-api-url:3000
```

### Authentication

Login credentials are managed by your backend. Contact your admin for credentials.

## Troubleshooting

### Issue: "Cannot connect to backend"
- Verify backend is running at `http://192.168.0.122:3000`
- Check CORS settings on backend
- Verify network connectivity

### Issue: "No markers on map"
- Ensure active SOS alerts exist in the database
- Check browser console for errors
- Verify API token is valid

### Issue: "Map not loading"
- Check internet connection for map tiles
- Verify Leaflet CSS is loaded
- Clear browser cache

## Development

### Hot Reload
The development server supports hot module replacement (HMR) for instant updates.

### Debugging
Open browser DevTools (F12) to:
- View console errors
- Inspect Network tab for API calls
- Debug components using React DevTools

## Performance

The dashboard is optimized for:
- Efficient real-time updates (3-second polling)
- Smooth map interactions
- Fast component rendering
- Minimal API calls

## Security

- JWT token authentication
- Secure token storage in localStorage
- Automatic logout on 401 errors
- Protected routes

## Support

For issues or feature requests, contact your development team.

## License

© 2024 Women Safety System. All rights reserved.
