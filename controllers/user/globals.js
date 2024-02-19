import { Op } from "sequelize";
import { Retweet, Like, User, Tweet, sequelize } from "../../sequelize.js";

export const getMyRetweets = async (id) => {
  const retweets = await Retweet.findAll({
    attributes: ["tweetId"],
    where: {
      userId: id,
    },
    raw: true,
  });
  return retweets;
};

export const getMyLikes = async (id) => {
  const likes = await Like.findAll({
    attributes: ["tweetId"],
    where: {
      userId: id,
    },
    raw: true,
  });
  return likes;
};

export const getLikedTweets = async (id, tweetAttributes) => {
  // const sql = `select Likes.tweetId from Likes inner join Users on Users.id=Likes.userId where Users.id='${id}'`;
  try {
    // const tweets = await User.findAll({
    //   attributes: ["firstname", "lastname", "username", "avatar"],
    //   include: {
    //     model: Tweet,
    //     required: true,
    //     attributes: tweetAttributes,
    //     where: {
    //       id: {
    //         [Op.in]: sequelize.literal(`(${sql})`),
    //       },
    //     },
    //   },
    //   raw: true,
    // });
    const tweets = await User.findAll({
      attributes: ["firstname", "lastname", "username", "avatar"],
      include: [
        {
          model: Tweet,
          required: true,
          attributes: tweetAttributes,
          include: {
            model: Like,
            attributes: [],
            where: { userId: id },
          },
        },
      ],
      raw: true, // Setting raw to true returns plain JavaScript objects
    });
    return tweets;
  } catch (error) {
    return error;
  }
};

export const getUserTweets = async (id, tweetAttributes) => {
  let tweets = await User.findAll({
    attributes: ["firstname", "lastname", "username", "avatar"],
    include: {
      model: Tweet,
      required: true,
      attributes: tweetAttributes,
      where: {
        userId: id,
      },
    },
    raw: true,
  });
  return tweets;
};

export const getUserRetweets = async (id, tweetAttributes) => {
  // const sql = `select Retweets.tweetId from Retweets inner join Tweets on Tweets.id=Retweets.tweetId where Retweets.userId='${id}'`;

  try {
    let retweets = await User.findAll({
      attributes: ["firstname", "lastname", "username", "avatar"],
      include: {
        model: Tweet,
        required: true,
        attributes: tweetAttributes,
        // where: {
        //   id: {
        //     [Op.in]: sequelize.literal(`(${sql})`),
        //   },
        // },
        where: { userId: id },
      },
      raw: true,
    });
    return retweets;
  } catch (error) {
    return error;
  }
};
