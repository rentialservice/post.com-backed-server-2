import { Router } from 'express';
import { searchUser } from '../controllers/explore.js';

const router = Router();

router.get('/', searchUser);

export default router;
