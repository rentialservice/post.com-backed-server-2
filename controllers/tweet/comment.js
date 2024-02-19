import { Comment, Tweet, User } from '../../sequelize.js';
import { putImage,deleteImage } from "../../utils/s3.js";
import { imageCategory,getImageName } from "../../utils/common.js"

export const addComment = async (req, res) => {
  // body -> {tweetId, userId, text}
  // console.log(req.body);
  putImage(getImageName(req.file.originalname),imageCategory.media,req.file.buffer, req.file.mimetype).then(async (media) => {
    // console.log(media);
    Promise.all([
      await Comment.create({
        tweetId: req.body.tweetId,
        userId: req.body.userId,
        text: req.body.text,
        media: media,
      }),
      await Tweet.increment('commentsCount', {
        by: 1,
        where: { id: req.body.tweetId },
      }),
    ]).then((values) => {
      // console.log(values);
      return res.status(200).json({ comment: values[0] });
    });
  });
};

export const removeComment = async (req, res) => {
  // body -> {tweetId, userId, id}
  const comment = await Comment.findOne({
    where: req.body,
  })
  const media=comment.media;
  Promise.all([
    await deleteImage(media),
    await Comment.destroy({
      where: req.body,
    }),
    await Tweet.decrement('commentsCount', {
      by: 1,
      where: { id: req.body.tweetId },
    }),
  ]).then((values) => {
    console.log(values);
    return res.status(200).json({ comment: values[0] });
  });
};

export const getTweetComments = async (req, res) => {
  // body -> {tweetId}
  const comments = await User.findAll({
    attributes: ['firstname', 'lastname', 'username', 'avatar'],
    include: {
      model: Comment,
      required: true,
      where: req.query,
    },
    order: [[Comment, 'createdAt', 'DESC']],
    raw: true,
  });
  return res.status(200).json({ comments });
};
