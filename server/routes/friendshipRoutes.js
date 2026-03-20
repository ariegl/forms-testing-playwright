import express from 'express';
import { 
  sendFriendRequest, 
  getFriendRequests, 
  updateFriendshipStatus, 
  getFriendsList 
} from '../controllers/friendshipController.js';

const router = express.Router();

router.post('/request', sendFriendRequest);
router.get('/requests/:user_id', getFriendRequests);
router.put('/:id/status', updateFriendshipStatus);
router.get('/list/:user_id', getFriendsList);

export default router;
