import express from 'express';
import {
  createListing,
  getListings,
  getListing,
  updateListing,
  deleteListing,
  findMatches,
  markAsMatched
} from '../controllers/earbudListingController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getListings);
router.get('/:id', getListing);

// Protected routes
router.post('/', authenticateJWT, createListing);
router.put('/:id', authenticateJWT, updateListing);
router.delete('/:id', authenticateJWT, deleteListing);
router.get('/:id/matches', authenticateJWT, findMatches);
router.post('/match', authenticateJWT, markAsMatched);

export default router; 