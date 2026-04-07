🚨 Women Safety SOS System

A full-stack real-time women safety application with emergency SOS alerts, live tracking, and admin monitoring dashboard.

📌 Overview

This project is designed to provide instant emergency assistance.
Users can trigger an SOS alert, share their live location, and notify emergency contacts.
Admins can monitor incidents in real-time via a dashboard.

🧱 Tech Stack

📱 Mobile App
React Native (Expo)
Location Services (GPS)
SMS Integration

🌐 Backend
Node.js + Express
MongoDB Atlas (Cloud Database)
Mongoose ORM

🖥 Admin Dashboard
React (Vite)
Tailwind CSS
React Leaflet (Maps)

🔥 Features

📱 Mobile App
One-tap SOS trigger
Live GPS location tracking
Background tracking support
SMS alerts to emergency contacts
Guest + User mode

🌐 Backend
REST API for SOS alerts
Multi-user support
Tracking data storage
SOS lifecycle:
Active → Assigned → Resolved
MongoDB cloud integration

🖥 Admin Dashboard
Admin login (JWT authentication)
Real-time SOS alerts
Interactive map with markers
View user details & location
Assign responders (Police 🚓 / Ambulance 🚑)
Resolve incidents
History tracking

🗺 System Architecture
Mobile App → Backend API → MongoDB Atlas → Admin Dashboard

⚙️ Setup Instructions
1️⃣ Clone Repository
git clone <your-repo-url>
cd women-safety-app
2️⃣ Backend Setup
cd server
npm install

Create .env:

# Production-ready environment variables sample
PORT=3000
MONGODB_URI=<your_atlas_connection_string>
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://<your-lan-ip>:5173,http://<your-lan-ip>:5174
NODE_ENV=development

# Expo app integration
EXPO_PUBLIC_SOS_API_URL=http://<your-server-ip>:3000/api/sos
EXPO_PUBLIC_SMS_RECIPIENTS=+15551234567,+15559876543
Run server:

node server.mjs
3️⃣ Mobile App Setup
cd app
npm install
npx expo start

Update .env:

EXPO_PUBLIC_SOS_API_URL=http://<YOUR_LAN_IP>:3000/api/sos
4️⃣ Admin Dashboard Setup
cd admin
npm install
npm run dev
🔐 Admin Login

Create admin:

node create-admin.mjs

Credentials:

Email: admin@example.com
Password: ad

📡 API Endpoints

SOS
POST /api/sos → Trigger SOS
GET /api/active-sos → Active alerts
PUT /api/sos/:sosId/resolve → Resolve SOS
PUT /api/sos/:id/assign → Assign responder
Tracking
GET /api/sos/tracking/:sosId → Get tracking data
Admin
POST /api/admin/login → Admin login

🧪 Testing
Trigger SOS from mobile app
Verify in admin dashboard
Check map updates
Assign and resolve alerts

🚀 Future Improvements
WebSocket real-time updates
Push notifications
AI-based threat detection
Offline tracking sync
Role-based admin access

🏆 Project Status
✅ Mobile App: Complete
✅ Backend: Complete
✅ Admin Dashboard: Complete

🚀 Ready for deployment

👨‍💻 Author
Ravi Kiran
⭐ If you like this project

Give it a ⭐ on GitHub!
