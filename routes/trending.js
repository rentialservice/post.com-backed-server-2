import { Router } from 'express';
import { getTrendingHashtags } from '../controllers/trending.js';

const router = Router();

router.get('/', getTrendingHashtags);

export default router;
