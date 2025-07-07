# BudMatching – Find Your Lost Earbuds 🎧

**BudMatching** is a full-stack platform designed to help users **find and match lost or found earbuds** using intelligent filtering, real-time chat, and user-friendly listings. Whether you’ve lost one bud or found someone else’s, BudMatching helps connect the right users to complete their pair.

> 🚧 **Note**: This project is currently in development and not yet live.

---

## 🧹 Features

* **User Authentication**

  * Register/login with email & password
  * Google OAuth support
  * Secure JWT-based authentication
  * Password reset feature

* **Earbud Listings**

  * Create, view, update, and delete lost/found listings
  * Upload images (via Cloudinary)
  * Filter listings by brand, model, location, etc.
  * Add earbuds to your watchlist/favorites

* **User Profiles**

  * View and edit profile details
  * Upload profile pictures
  * View your posted listings
  * Manage saved/favorite earbuds

* **Real-time Chat**

  * Start conversations with users who posted listings
  * Chat live using **Socket.io**
  * Typing indicators and notifications

* **Responsive Design**

  * Mobile-first UI
  * Built with Material-UI
  * Clean and intuitive user interface

---

## 💻 Tech Stack

### Frontend

* React.js
* Redux Toolkit
* Material-UI
* Formik & Yup
* Axios
* Socket.io-client

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT + Passport.js
* Multer & Cloudinary
* Socket.io

---

## ⚙️ Installation & Setup

### Requirements

* Node.js
* MongoDB (local or Atlas)
* Cloudinary account
* Google Developer Console OAuth credentials

### `.env` Configuration

#### Backend (`server/.env`)

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
```

#### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
```

### 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/budmatching.git
cd budmatching

# Install server dependencies
cd server
npm install

# Start the backend server
npm run dev

# In a new terminal, install frontend dependencies
cd ../client
npm install

# Start the frontend app
npm run dev
```

### Access the App

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:5000](http://localhost:5000)

---

## 📟 API Endpoints

### Auth Routes

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`
* `POST /api/auth/forgot-password`
* `POST /api/auth/reset-password`

### User Routes

* `GET /api/users/profile`
* `PUT /api/users/profile`
* `PUT /api/users/password`
* `POST /api/users/profile/picture`

### Earbud Listings

* `GET /api/listings`
* `GET /api/listings/:id`
* `POST /api/listings`
* `PUT /api/listings/:id`
* `DELETE /api/listings/:id`
* `GET /api/listings/user/:userId`
* `POST /api/listings/:id/favorite`
* `DELETE /api/listings/:id/favorite`

### Messaging

* `GET /api/messages/chats`
* `GET /api/messages/chat/:chatId`
* `POST /api/messages`
* `POST /api/messages/chat`
* `PUT /api/messages/read/:chatId`

---

## 📁 Project Structure

```
budmatching/
├── server/                   # Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   ├── socket.js
│   └── server.js
└── client/                   # Frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── store/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── vite.config.js
```

---

## 🧪 Screenshots

> *Screenshots will be added once the UI is completed.*

---

## 🔮 Upcoming Features

* Map-based location tagging for lost/found devices
* AI-driven bud matching (e.g., by serial/model proximity)
* Escrow-based deposit handling for high-value devices
* Verified listing system
* Progressive Web App (PWA) support

---

## 🛠 Troubleshooting

* **Server won’t start** → Check MongoDB URI & `.env` setup
* **Image uploads fail** → Double-check Cloudinary keys
* **Auth errors** → Ensure JWT secret and OAuth configs are valid
* **Real-time issues** → Verify Socket.io setup and client/server URLs

---

## 🤝 Contributing

Pull requests are welcome! Open issues if you find bugs or want to suggest features.

---

## 📄 License

This project is licensed under the **MIT License**.
