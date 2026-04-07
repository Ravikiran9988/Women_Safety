# Women Safety App - Backend Server

Production-ready Node.js Express server with MVC architecture for multi-user SOS tracking.

## Features

- **MVC Architecture**: Organized controllers, routes, and middleware
- **Multi-user Support**: User management with MongoDB
- **Real-time Tracking**: Background location tracking with persistence
- **Backward Compatibility**: Legacy endpoints for existing mobile app
- **Error Handling**: Comprehensive error middleware
- **Health Checks**: Server and database status monitoring

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud)

### MongoDB Setup

#### Option 1: MongoDB Atlas (Cloud - Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Create `.env` file in project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/safety?retryWrites=true&w=majority
NODE_ENV=development
PORT=3000
```

#### Option 2: Local MongoDB

1. Install MongoDB Community Server
2. Start MongoDB service
3. Use default connection: `mongodb://127.0.0.1:27017/safety`

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm run sos-server
```

The server will start on `http://localhost:3000`

## API Endpoints

### User Management
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID

### SOS Management
- `POST /api/sos` - Create SOS alert
- `PUT /api/sos/:id/resolve` - Resolve SOS
- `GET /api/sos/active` - Get active SOS records

### Tracking
- `POST /api/tracking` - Save tracking update
- `GET /api/tracking/sos/:sosId` - Get tracking for SOS
- `GET /api/tracking/latest` - Get latest tracking point
- `GET /api/tracking/summary` - Get tracking summary

### Legacy Endpoints (Backward Compatibility)
- `POST /api/sos` - Combined SOS/tracking endpoint
- `GET /api/latest` - Latest tracking point
- `GET /api/tracking/:sosId` - Tracking for SOS
- `GET /api/active-sos` - Active SOS records
- `PUT /api/sos/:sosId/resolve` - Resolve SOS

### Health
- `GET /health` - Server health check

## Project Structure

```
server/
├── config/
│   └── db.mjs                 # Database configuration
├── controllers/
│   ├── userController.mjs     # User management logic
│   ├── sosController.mjs      # SOS management logic
│   └── trackingController.mjs # Tracking management logic
├── middleware/
│   └── errorHandler.mjs       # Error handling middleware
├── models/
│   ├── User.mjs              # User schema
│   ├── SOS.mjs               # SOS schema
│   └── Tracking.mjs          # Tracking schema
├── routes/
│   ├── userRoutes.mjs        # User routes
│   ├── sosRoutes.mjs         # SOS routes
│   └── trackingRoutes.mjs    # Tracking routes
└── server.mjs                # Main server file
```

## Development

### Running Tests

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test user creation
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"+1234567890"}'
```

### Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)

## Mobile App Integration

Update your Expo app's environment variables:

```javascript
// app.json or .env
EXPO_PUBLIC_SOS_API_URL=http://your-server-ip:3000/api
```

For physical devices, replace `localhost` with your computer's LAN IP address.

## Migration from Legacy Server

The new server maintains backward compatibility with existing mobile app versions. Legacy endpoints are still available but deprecated. New features require updating to the new API structure.

## Troubleshooting

### MongoDB Connection Issues

1. Verify MongoDB is running (local) or connection string is correct (Atlas)
2. Check firewall settings for port 27017 (local)
3. Ensure IP whitelist includes your IP (Atlas)

### Server Won't Start

1. Check Node.js version: `node --version` (should be 18+)
2. Verify all dependencies: `npm install`
3. Check for port conflicts on 3000

### CORS Issues

Update CORS origins in `server.mjs` for production domains.