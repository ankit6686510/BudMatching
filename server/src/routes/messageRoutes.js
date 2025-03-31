import express from 'express';
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead
} from '../controllers/messageController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(authenticateJWT);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/:userId/:listingId', getMessages);
router.put('/:messageId/read', markAsRead);

export default router; 