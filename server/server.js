import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import session from 'express-session';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import rateLimit from 'express-rate-limit';
import winston from 'winston';

// Load environment variables
dotenv.config();

// Import models
import User from './src/models/User.js';
import Message from './src/models/Message.js';
import EarbudListing from './src/models/EarbudListing.js';
import Chat from './src/models/Chat.js';

// Import socket.io initialization
import { initializeSocket } from './socket.js';

// Import routes
import userRoutes from './src/routes/userRoutes.js';
import earbudListingRoutes from './src/routes/earbudListingRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.io
const io = initializeSocket(httpServer);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure storage for image uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'budmatching_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Make io accessible to the routes
app.set('io', io);

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use(limiter);

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  const maxRetries = 5;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000
      });
      logger.info('Connected to MongoDB');
      return;
    } catch (error) {
      retries++;
      logger.error(`MongoDB connection attempt ${retries} failed:`, error);
      if (retries === maxRetries) {
        logger.error('Max retries reached. Could not connect to MongoDB');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

connectWithRetry();

// Configure JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'budmatching_jwt_secret'
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Modified upload handler for Cloudinary
const handleCloudinaryUpload = async (file) => {
  return new Promise((resolve, reject) => {
    // Create a buffer from the file data
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    // Upload to Cloudinary
    cloudinary.uploader.upload(dataURI, {
      folder: 'budmatching'
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
  });
};

// Auth check middleware
const authCheck = passport.authenticate('jwt', { session: false });

// Add a verification endpoint for user's token
app.get('/api/auth/verify', authCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ valid: false, message: 'User not found' });
    }
    
    res.status(200).json({ valid: true, user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ valid: false, message: 'Server error' });
  }
});

// Input validation middleware
const validateUserInput = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  
  next();
};

// Update registration route to use validation
app.post('/api/auth/register', validateUserInput, async (req, res) => {
  try {
    const { name, email, password, location } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      location: location || ''
    });
    
    const savedUser = await newUser.save();
    
    // Generate JWT
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET || 'budmatching_jwt_secret',
      { expiresIn: '7d' }
    );
    
    // Remove password from response
    const userResponse = savedUser.toJSON();
    
    logger.info(`New user registered: ${email}`);
    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    // If user doesn't exist
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'budmatching_jwt_secret',
      { expiresIn: '7d' }
    );
    
    // Use the toJSON method to get the sanitized user object
    const userResponse = user.toJSON();
    
    res.status(200).json({ user: userResponse, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// User Routes
app.get('/api/users/profile', authCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/profile', authCheck, async (req, res) => {
  try {
    const { name, location, bio } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, location, bio },
      { new: true }
    ).select('-password');
    
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile picture upload route
app.post('/api/users/profile/picture', authCheck, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Upload to Cloudinary
    const imageUrl = await handleCloudinaryUpload(req.file);
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: imageUrl },
      { new: true }
    ).select('-password');
    
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Listing Routes
app.get('/api/listings', async (req, res) => {
  try {
    const { user, search, minPrice, maxPrice, brand, model, side, condition } = req.query;
    
    let query = {};
    
    // Filter by seller
    if (user) {
      query.seller = user;
    }
    
    // Search by text
    if (search) {
      query.$or = [
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    // Filter by specific attributes
    if (brand) query.brand = brand;
    if (model) query.model = model;
    if (side) query.side = side;
    if (condition) query.condition = condition;
    
    const listings = await EarbudListing.find(query)
      .sort({ createdAt: -1 })
      .populate('seller', 'name avatar');
    
    res.status(200).json({ listings });
  } catch (error) {
    console.error('Listings fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await EarbudListing.findById(req.params.id)
      .populate('seller', 'name avatar location');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.status(200).json({ listing });
  } catch (error) {
    console.error('Listing fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Listing creation route with image upload
app.post('/api/listings', authCheck, upload.array('images', 5), async (req, res) => {
  try {
    const { brand, model, side, condition, price, description, location } = req.body;
    
    // Upload images to Cloudinary
    const imagePromises = req.files.map(file => handleCloudinaryUpload(file));
    const images = await Promise.all(imagePromises);
    
    const newListing = new EarbudListing({
      brand,
      model,
      side,
      condition,
      price: parseFloat(price),
      description,
      location,
      images,
      seller: req.user._id
    });
    
    await newListing.save();
    
    // Populate seller info
    await newListing.populate('seller', 'name avatar');
    
    res.status(201).json({ listing: newListing });
  } catch (error) {
    console.error('Listing creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/listings/:id', authCheck, async (req, res) => {
  try {
    const listing = await EarbudListing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user is the seller
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const { brand, model, side, condition, price, description, location } = req.body;
    
    const updatedListing = await EarbudListing.findByIdAndUpdate(
      req.params.id,
      { brand, model, side, condition, price, description, location },
      { new: true }
    ).populate('seller', 'name avatar');
    
    res.status(200).json({ listing: updatedListing });
  } catch (error) {
    console.error('Listing update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/listings/:id', authCheck, async (req, res) => {
  try {
    const listing = await EarbudListing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check if user is the seller
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await EarbudListing.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Listing deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Favorite handling
app.post('/api/listings/:id/favorite', authCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if listing already in favorites
    if (user.favorites.includes(req.params.id)) {
      return res.status(400).json({ message: 'Listing already in favorites' });
    }
    
    // Add to favorites
    user.favorites.push(req.params.id);
    await user.save();
    
    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/listings/:id/favorite', authCheck, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove from favorites
    user.favorites = user.favorites.filter(id => id.toString() !== req.params.id);
    await user.save();
    
    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Messages Routes
app.get('/api/messages/chats', authCheck, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
      .populate('participants', 'name avatar')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    
    res.status(200).json({ chats });
  } catch (error) {
    console.error('Chats fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/messages/chat/:chatId', authCheck, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if user is a participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const messages = await Message.find({ chat: req.params.chatId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar');
    
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Messages fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/messages', authCheck, async (req, res) => {
  try {
    const { chatId, content } = req.body;
    
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if user is a participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    const newMessage = new Message({
      chat: chatId,
      sender: req.user._id,
      content
    });
    
    await newMessage.save();
    
    // Update chat with last message
    chat.lastMessage = newMessage._id;
    chat.updatedAt = Date.now();
    await chat.save();
    
    // Populate sender
    await newMessage.populate('sender', 'name avatar');
    
    // Emit to all participants
    const receiver = chat.participants.find(
      participantId => participantId.toString() !== req.user._id.toString()
    );
    
    if (receiver) {
      io.to(receiver.toString()).emit('new-message', newMessage);
    }
    
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Message send error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/messages/chat', authCheck, async (req, res) => {
  try {
    const { userId, listingId, initialMessage } = req.body;
    
    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, userId] },
      listing: listingId
    });
    
    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [req.user._id, userId],
        listing: listingId
      });
      
      await chat.save();
    }
    
    // Send initial message if provided
    if (initialMessage) {
      const newMessage = new Message({
        chat: chat._id,
        sender: req.user._id,
        content: initialMessage
      });
      
      await newMessage.save();
      
      // Update chat with last message
      chat.lastMessage = newMessage._id;
      chat.updatedAt = Date.now();
      await chat.save();
      
      // Emit to recipient
      io.to(userId).emit('new-chat', {
        chat,
        message: newMessage
      });
    }
    
    // Populate chat info
    await chat.populate('participants', 'name avatar');
    
    res.status(201).json({ chat });
  } catch (error) {
    console.error('Chat creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/messages/read/:chatId', authCheck, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Check if user is a participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Mark all messages as read
    await Message.updateMany(
      {
        chat: req.params.chatId,
        sender: { $ne: req.user._id },
        read: false
      },
      { read: true }
    );
    
    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/listings', earbudListingRoutes);
app.use('/api/messages', messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Environment variable validation
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const validateEnvVars = () => {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.error('Missing required environment variables:', missingVars);
    process.exit(1);
  }
  
  // Validate MongoDB URI format
  if (!process.env.MONGODB_URI.startsWith('mongodb://') && 
      !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    logger.error('Invalid MongoDB URI format');
    process.exit(1);
  }
  
  // Validate JWT secret length
  if (process.env.JWT_SECRET.length < 32) {
    logger.error('JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }
};

// Validate environment variables before starting the server
validateEnvVars();

// Function to find an available port
const findAvailablePort = async (startPort) => {
  const net = await import('net');
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on('error', () => {
      resolve(findAvailablePort(startPort + 1));
    });
    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
};

// Start server with port fallback
const startServer = async () => {
  try {
    const port = await findAvailablePort(parseInt(process.env.PORT) || 5000);
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 