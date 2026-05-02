# Student Notes Exchange Portal

A production-ready MERN-stack web application designed for students to seamlessly share, discover, and manage academic resources. The platform allows users to upload study materials, bookmark important notes, and features an integrated moderation system to ensure content quality.

## Features

- **User Authentication**: Secure signup and login functionality using JWT and bcrypt.
- **Notes Management**: Upload, view, and manage study notes.
- **Cloud Storage Integration**: Seamless file uploads using Cloudinary (with local fallback).
- **Bookmarking**: Save favorite notes for quick access later.
- **Content Moderation**: Built-in reporting system for users to flag inappropriate or low-quality content.
- **Responsive UI**: Modern, accessible, and responsive frontend built with React and Tailwind CSS.
- **Admin Dashboard**: Moderation tools for administrators to review reports and manage content.

## Tech Stack

### Frontend
- **React** (via Vite)
- **Tailwind CSS** (Styling)
- **React Router Dom** (Navigation)
- **Axios** (API Client)
- **React Dropzone** (File Upload UI)
- **Headless UI & React Icons** (UI Components)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Database & ODM)
- **Cloudinary & Multer** (File Storage)
- **JSON Web Tokens (JWT)** (Authentication)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or Atlas URI)
- Cloudinary Account (for file uploads)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/student-notes-exchange-portal.git
   cd student-notes-exchange-portal
   ```

2. **Install dependencies for both backend and frontend:**
   ```bash
   npm install
   cd frontend && npm install
   cd ..
   ```

3. **Configure Environment Variables:**
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
     CLOUDINARY_API_KEY=your_cloudinary_api_key
     CLOUDINARY_API_SECRET=your_cloudinary_api_secret
     ```

4. **Seed the database (Optional):**
   ```bash
   npm run seed
   ```

5. **Run the application:**
   You can run both the frontend and backend concurrently from the root directory:
   ```bash
   npm run dev:all
   ```
   - The backend server will run on `http://localhost:5000` (or your configured PORT).
   - The frontend will typically run on `http://localhost:5173`.

## Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## License
This project is licensed under the ISC License.
