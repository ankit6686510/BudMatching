import express from 'express';
import userRoutes from './userRoutes.js';
import earbudListingRoutes from './earbudListingRoutes.js';
import messageRoutes from './messageRoutes.js';

const router = express.Router();

// API routes
router.use('/api/users', userRoutes);
router.use('/api/listings', earbudListingRoutes);
router.use('/api/messages', messageRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default router; 