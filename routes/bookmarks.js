import { Router } from 'express';
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
} from '../controllers/bookmarks.js';

const router = Router();

router.get('/', getBookmarks);
router.post('/add', addBookmark);
router.delete('/remove', removeBookmark);

export default router;
