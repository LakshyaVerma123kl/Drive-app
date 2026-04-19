# FileDrive - Google Drive-like File Manager

A full-stack web application where users can register, create nested folders, and upload images inside folders.

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React (Vite)
- **Database**: MongoDB Atlas
- **Auth**: JWT (bcryptjs)
- **File Upload**: Multer

## Setup

### 1. Clone and Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Create `server/.env` with your MongoDB Atlas credentials:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/filedrive?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
PORT=5000
```

### 3. Run

```bash
# Start backend (from /server)
npm start

# Start frontend (from /client)
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Features

- ✅ User Signup / Login / Logout (JWT)
- ✅ Create nested folders (Google Drive-like)
- ✅ Folder size (recursive calculation across all nested levels)
- ✅ Upload images (Name + File)
- ✅ User-specific access (data isolation)
- ✅ Delete folders / images
- ✅ Breadcrumb navigation

## Test Credentials

```
Email: test@filedrive.com
Password: test123
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Folders
- `GET /api/folders?parent=` - List folders
- `GET /api/folders/:id` - Get folder
- `GET /api/folders/:id/path` - Get breadcrumb
- `POST /api/folders` - Create folder
- `DELETE /api/folders/:id` - Delete folder

### Images
- `GET /api/images?folder=` - List images
- `POST /api/images` - Upload image (multipart)
- `DELETE /api/images/:id` - Delete image
