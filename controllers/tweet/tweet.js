import { Sequelize } from "sequelize";
import { Tweet, User, Like, Comment, Retweet } from "../../sequelize.js";
import {
  addTweetValidation,
  extractHashtags,
  extractTaggedUsers,
} from "../../utils/validation.js";
import { putImage, deleteImage } from "../../utils/s3.js";
import { imageCategory, getImageName } from "../../utils/common.js";

export const addTweet = async (req, res) => {
  // Joi validation checks
  const validation = addTweetValidation(req.body);
  if (validation.error) {
    return res.status(400).json({ errors: validation.error.details });
  }

  const hashtags = extractHashtags(req.body.text);
  const taggedUsers = extractTaggedUsers(req.body.text);

  // Check if req.file is defined before using it
  if (req.file) {
    putImage(
      getImageName(req.file.originalname),
      imageCategory.media,
      req.file.buffer,
      req.file.mimetype
    ).then(async (media) => {
      try {
        const tweet = await Tweet.create({
          userId: req.body.userId,
          text: req.body.text,
          media: media,
          hashtags: hashtags.join(","),
          taggedUsers: taggedUsers.join(","),
          categories: req.body.categories,
        });

        // Notify tagged users
        const notifiedUsers = await User.findAll({
          where: { username: { [Sequelize.Op.in]: taggedUsers } },
        });

        notifiedUsers.forEach((user) => {
          console.log("Notify tagged users --> ", user);
          // TODO Notify the user, e.g., send a push notification or email
        });

        return res.status(200).json({ tweet });
      } catch (err) {
        console.log(err);
        return res.status(400).json({ errors: err });
      }
    });
  } else {
    // Handle the case where req.file is not defined (no file uploaded)
    try {
      const tweet = await Tweet.create({
        userId: req.body.userId,
        text: req.body.text,
        hashtags: hashtags.join(","),
        taggedUsers: taggedUsers.join(","),
        categories: req.body.categories,
      });

      // Notify tagged users
      const notifiedUsers = await User.findAll({
        where: { username: { [Sequelize.Op.in]: taggedUsers } },
      });

      notifiedUsers.forEach((user) => {
        console.log("Notify tagged users --> ", user);
        // TODO Notify the user, e.g., send a push notification or email
      });

      return res.status(200).json({ tweet });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ errors: err });
    }
  }
};


export const getTweet = async (req, res) => {
  // body -> {tweetId, username, myId}
  Promise.all([
    await getUserTweet(req.query.tweetId, req.query.username),
    await isLikedByMe(req.query.tweetId, req.query.myId),
    await isRetweetedByMe(req.query.tweetId, req.query.myId),
  ]).then((values) => {
    let tweet = { ...values[0] };
    tweet = { ...tweet, selfLiked: values[1] ? true : false };
    tweet = { ...tweet, selfRetweeted: values[2] ? true : false };
    return res.status(200).json({ tweet });
  });
};

export const removeTweet = async (req, res) => {
  console.log("removing", req.body);
  const { tweetId } = req.body;
  // body -> {tweetId}
  try {
    const tweet = await Tweet.findByPk(tweetId);
    if (!tweet) {
      return res.status(404).json({ error: "Tweet not found" });
    }

    const media = tweet.media;
    const values = await Promise.all([
      deleteImage(media),
      Tweet.destroy({ where: { id: tweetId } }),
      Like.destroy({ where: { tweetId } }),
      Comment.destroy({ where: { tweetId } }),
      Retweet.destroy({ where: { tweetId } }),
    ]);

    return res.status(200).json({ tweet: values[0] });
  } catch (error) {
    console.error("Error removing tweet:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserTweet = async (tweetId, username) => {
  const tweet = await User.findOne({
    attributes: ["firstname", "lastname", "username", "avatar"],
    where: {
      username: username,
    },
    include: {
      model: Tweet,
      where: {
        id: tweetId,
      },
      required: true,
    },
    raw: true,
  });
  return tweet;
};

export const isLikedByMe = async (tweetId, id) => {
  const like = await Like.findOne({
    where: {
      tweetId,
      userId: id,
    },
  });
  return like;
};

export const isRetweetedByMe = async (tweetId, id) => {
  const retweet = await Retweet.findOne({
    where: {
      tweetId,
      userId: id,
    },
  });
  return retweet;
};
