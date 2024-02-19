import { Router } from 'express';
import { getFeed, whoFollow } from '../controllers/feed.js';

const router = Router();

router.get('/', getFeed);
router.get('/who-follow', whoFollow);

export default router;