# Maritime Fleet Tracking & Analytics System

A full-stack web application designed for real-time vessel monitoring, route visualization, and role-based security.

##  Tech Stack
- **Frontend:** React.js, Leaflet.js (Map), Chart.js (Analytics)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Cloud)
- **Security:** JWT, Bcrypt (Role-Based Access Control)

##  Setup Instructions
1. **Clone the repository:** `git clone <your-repo-link>`
2. **Server Setup:**
   - Go to `/server` folder.
   - Create a `.env` file and add: `MONGO_URI=your_mongodb_link` and `PORT=5000`.
   - Run `npm install` and `node server.js`.
3. **Client Setup:**
   - Go to `/client` folder.
   - Run `npm install` and `npm run dev`.

##  Access Control
- **Admin:** Full CRUD (Create, View, Delete) + Map + Analytics.
- **Operator:** View Map/Analytics + Update Vessel Status.
- **Viewer (User):** Read-only access to Map and Registry.
