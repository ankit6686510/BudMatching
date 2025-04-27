# BudMatching - Platform for Finding Roommates & Accommodations


BudMatching is a comprehensive platform designed to connect individuals looking for roommates or accommodations. This full-stack application allows users to create listings, search for properties, message potential roommates, and manage their profiles.

## Features

- **User Authentication**
  - Email/Password registration and login
  - Google OAuth integration
  - JWT-based authentication
  - Password reset functionality

- **Listings Management**
  - Create, read, update, and delete property listings
  - Upload multiple images with Cloudinary integration
  - Advanced filtering options (price, location, amenities)
  - Add listings to favorites

- **User Profiles**
  - View and edit personal information
  - Upload profile pictures
  - View all user listings
  - Manage favorite properties

- **Real-time Messaging**
  - Start conversations with property owners
  - Real-time chat with Socket.io
  - Typing indicators
  - Message notifications

- **Responsive Design**
  - Mobile-friendly interface
  - Material-UI components
  - Intuitive user experience

## Tech Stack

### Frontend
- React.js
- Redux Toolkit (state management)
- Material-UI (component library)
- Formik & Yup (form validation)
- Socket.io-client (real-time communication)
- Axios (API requests)

### Backend
- Node.js
- Express.js
- MongoDB (database)
- Mongoose (ODM)
- Passport.js (authentication)
- JWT (JSON Web Tokens)
- Socket.io (real-time communication)
- Cloudinary (image storage)
- Multer (file uploads)

## Installation & Setup

### Prerequisites
- Node.js (v14.x or later)
- MongoDB account
- Cloudinary account
- Google Developer account (for OAuth)-----

### Environment Variables

#### Server (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
```

#### Client (.env)
```
VITE_API_URL=http://localhost:5000
```

### Setup Instructions

1. **Clone the repository**
   ```
   git clone https://github.com/your-username/budmatching.git
   cd budmatching
   ```

2. **Install dependencies**
   ```
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Start the development servers**
   ```
   # Start the server (from the server directory)
   npm run dev

   # Start the client (from the client directory)
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `POST /api/users/profile/picture` - Upload profile picture

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get listing by ID
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `GET /api/listings/user/:userId` - Get listings by user
- `POST /api/listings/:id/favorite` - Add to favorites
- `DELETE /api/listings/:id/favorite` - Remove from favorites

### Messages
- `GET /api/messages/chats` - Get all user chats
- `GET /api/messages/chat/:chatId` - Get messages by chat
- `POST /api/messages` - Send new message
- `POST /api/messages/chat` - Start new chat
- `PUT /api/messages/read/:chatId` - Mark messages as read

## Project Structure

```
budmatching/
├── server/                   # Backend code
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth middleware
│   ├── utils/                # Helper functions
│   ├── config/               # Configuration
│   ├── .env                  # Environment variables
│   ├── socket.js             # Socket.io setup
│   └── server.js             # Entry point
└── client/                   # Frontend code
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page components
    │   ├── services/         # API service functions
    │   ├── store/            # Redux store
    │   │   ├── slices/       # Redux slices
    │   │   └── index.js      # Store configuration
    │   ├── utils/            # Helper functions
    │   ├── App.jsx           # Main component
    │   └── main.jsx          # Entry point
    ├── .env                  # Environment variables
    ├── index.html            # HTML template
    └── vite.config.js        # Vite configuration
```

## Screenshots
- Login/Register: User authentication screens
- Homepage: Listing overview with search and filters
- Listing Details: Property information with images
- Profile: User information and listings
- Messages: Chat interface

## Future Enhancements
- Location-based search with maps integration
- Advanced matching algorithm for roommate compatibility
- In-app payments for deposits
- Listing verification system
- Mobile application

## Troubleshooting
- **Server won't start**: Check MongoDB connection and port availability
- **Client build fails**: Verify all dependencies are installed
- **Auth issues**: Check JWT_SECRET and Google OAuth credentials
- **Image upload fails**: Verify Cloudinary credentials

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License. 