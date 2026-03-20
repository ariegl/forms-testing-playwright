import express from 'express';
import { sendMessage, getConversation, markAsRead } from '../controllers/messageController.js';

const router = express.Router();

router.post('/', sendMessage);
router.get('/:user1/:user2', getConversation);
router.put('/:id/read', markAsRead);

export default router;
