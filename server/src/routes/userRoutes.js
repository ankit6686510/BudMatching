import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  updateProfilePicture
} from '../controllers/userController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
router.put('/profile/picture', authenticateJWT, updateProfilePicture);

export default router; 