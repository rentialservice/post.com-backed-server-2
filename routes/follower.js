import { Router } from 'express';
import { followUser, getDetails } from '../controllers/follower.js';

const router = Router();

router.post('/', followUser);
router.get('/details', getDetails);

export default router;
