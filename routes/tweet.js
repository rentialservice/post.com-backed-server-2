import { Router } from 'express';
import multer from 'multer';
const upload = multer();

import {
  addTweet,
  getTweet,
  removeTweet,
} from '../controllers/tweet/tweet.js';

import {
  likeTweet,
  unlikeTweet,
  getTweetLikes,
} from '../controllers/tweet/like.js';

import {
  addRetweet,
  removeRetweet,
  getTweetRetweets,
} from '../controllers/tweet/retweet.js';

import {
  addComment,
  removeComment,
  getTweetComments,
} from '../controllers/tweet/comment.js';

const router = Router();

router.post('/add-tweet', upload.single('media'), addTweet);
router.get('/get-tweet', getTweet);
router.delete('/remove',removeTweet);

router.post('/like/add', likeTweet);
router.delete('/like/remove', unlikeTweet);
router.get('/like/get-likes', getTweetLikes);

router.post('/retweet/add', addRetweet);
router.delete('/retweet/remove', removeRetweet);
router.get('/retweet/get-retweets', getTweetRetweets);

router.post('/comment/add', upload.single('media'), addComment);
router.delete('/comment/remove', removeComment);
router.get('/comment/get-comments', getTweetComments);

export default router;
