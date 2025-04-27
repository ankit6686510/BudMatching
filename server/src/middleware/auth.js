import jwt from 'jsonwebtoken'; 
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';  // Import actual User model
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in environment variables');
  process.exit(1);
}

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'budmatching_jwt_secret_key_2024' // Fallback for development
};

// JWT Strategy for authentication
passport.use(
  new JwtStrategy(options, async (payload, done) => {
    try {
      const user = await User.findById(payload.id).select('-password'); // Exclude password
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      console.error('Error in JWT Strategy:', error);
      return done(error, false);
    }
  })
);

export const authenticateJWT = passport.authenticate('jwt', { session: false });

// Generate JWT Token
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'budmatching_jwt_secret_key_2024',
    { expiresIn: '7d' }
  );
};

// Middleware to verify token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'budmatching_jwt_secret_key_2024');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Invalid token:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
