# CareConnect Web App Development TODO - MongoDB Backend Migration

## Backend Setup (MongoDB Cluster)
- [x] Create backend/ directory structure
- [x] Create backend/package.json with dependencies (express, mongoose, bcryptjs, jsonwebtoken, multer, web-push, cors, dotenv)
- [x] Create backend/models/User.js (User schema for auth)
- [x] Create backend/models/Medicine.js (Medicine schema)
- [x] Create backend/models/Prescription.js (Prescription schema)
- [x] Create backend/middleware/auth.js (JWT authentication middleware)
- [x] Create backend/routes/auth.js (register/login routes)
- [x] Create backend/routes/medicines.js (CRUD for medicines)
- [x] Create backend/routes/prescriptions.js (CRUD for prescriptions, file upload)
- [x] Create backend/routes/history.js (query history)
- [x] Create backend/routes/notifications.js (schedule notifications)
- [x] Create backend/server.js (main server file with MongoDB connection)
- [x] Install backend dependencies with npm install

## Frontend Updates (Remove Firebase, Add API Calls)
- [x] Update index.html: Remove Firebase scripts, add API_BASE_URL constant
- [x] Delete js/firebase-config.js (file not found, possibly already deleted)
- [x] Update js/auth.js: Replace Firebase auth with JWT-based API calls
- [x] Update js/app.js: Update navigation and common logic for online-only
- [x] Update js/medicine.js: Replace Firestore with API calls for medicine CRUD
- [x] Update js/prescriptions.js: Replace Firebase Storage with API file upload
- [x] Update js/history.js: Replace Firestore queries with API calls
- [x] Update js/dashboard.js: Update for online data fetching
- [x] Update js/notifications.js: Replace local notifications with backend-scheduled push notifications
- [x] Update sw.js: Remove caching logic, keep basic PWA install (no Firebase caching found)
- [x] Update manifest.json: Adjust for online app

## MongoDB Cluster Setup
- [x] Create MongoDB Atlas cluster or use local MongoDB
- [x] Get connection string
- [x] Add .env file in backend/ with MONGO_URI, JWT_SECRET, etc.

## Testing and Deployment
- [ ] Run backend server (npm start)
- [ ] Test frontend with backend running
- [ ] Test authentication, medicine add/view, prescriptions upload, history, notifications
- [ ] Ensure app is fully online (no offline features)
- [ ] Final review and user feedback incorporation
__