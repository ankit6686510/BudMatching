import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  updateProfilePicture
} from '../controllers/userController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { userValidationRules } from '../utils/validators.js';

const router = express.Router();

// Public routes
router.post('/register', userValidationRules.register, register);
router.post('/login', userValidationRules.login, login);

// Protected routes
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);
router.put('/profile/picture', authenticateJWT, updateProfilePicture);

export default router; 