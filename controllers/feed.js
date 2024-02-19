// New ECMAScript module syntax
import { Op } from 'sequelize';
import { User, Tweet, Follower, sequelize, Retweet, Like } from '../sequelize.js';
import { getMyRetweets, getMyLikes } from './user/globals.js';

export const getFeed = async (req, res) => {
  if (!req.query.userId)
    return res.status(400).json({ errors: 'userId is required' });

  getMyFollowing(req.query.userId).then((response) => {
    const following = [];
    response.forEach((el) => following.push(el.id));
    // console.log("following--> ",following);
    Promise.all([
      getTweets(following),
      getRetweets(following),
      getLikes(following),
      getMyLikes(req.query.userId),
      getMyRetweets(req.query.userId),
    ]).then((values) => {

      let retweetSet = new Set();
      let likeSet = new Set();
      values[3].map((tweet) => likeSet.add(tweet.tweetId));
      values[4].map((tweet) => retweetSet.add(tweet.tweetId));

      let tweets = values[0].concat(values[1]).concat(values[2]);
      const uniqueSet = new Set();
      tweets = tweets.filter((tweet) => {
        if (uniqueSet.has(tweet["Tweets.id"])) return false;
        uniqueSet.add(tweet["Tweets.id"]);
        return true;
      });
      tweets.sort(
        (a, b) =>
          new Date(b["Tweets.createdAt"]) - new Date(a["Tweets.createdAt"])
      );
      tweets = tweets.map((tweet) => {
        let deepCopy = { ...tweet };
        if (retweetSet.has(tweet["Tweets.id"])) deepCopy.selfRetweeted = true;
        if (likeSet.has(tweet["Tweets.id"])) deepCopy.selfLiked = true;
        return deepCopy;
      });

      return res.status(200).json({ tweets: tweets });
      
      
      // return res.status(200).json({ tweets: values });

    });
  });
};

// export const whoFollow = async (req, res) => {
//   // query -> {userId}
//   // Get my following and don't select
//   const following = `SELECT Users.id FROM Users INNER JOIN Followers ON Users.id = Followers.followed WHERE follower = '${req.query.userId}'`;
//   const whoFollow = await User.findAll({
//     attributes: ['id', 'firstname', 'lastname', 'username', 'avatar'],
//     where: {
//       id: req.query.userId,
//       // id: {
//       //   [Op.not]: req.query.userId,
//       //   [Op.notIn]: sequelize.literal(`(${following})`),
//       // },
//     },
//     limit: 3,
//   });
//   return res.status(200).json({ whoFollow });
// };

export const whoFollow = async (req, res) => {
  try {
    // Get my following and don't select
    const following = await Follower.findAll({
      attributes: ['followed'],
      where: { follower: req.query.userId },
    });

    const whoFollow = await User.findAll({
      attributes: ['id', 'firstname', 'lastname', 'username', 'avatar'],
      where: {
        id: {
          [Op.not]: req.query.userId,
          [Op.notIn]: following.map((f) => f.followed),
        },
      },
      limit: 3,
    });

    return res.status(200).json({ whoFollow });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMyFollowing = async (id) => {
  const users = await User.findAll({
    attributes: ['id'],
    include: {
      model: Follower,
      as: 'Following',
      required: true,
      attributes: [],
      where: {
        follower: id,
      },
    },
    raw: true,
  });
  return users;
};

export const getTweets = async (following) => {
  const tweets = await User.findAll({
    attributes: ['firstname', 'lastname', 'username', 'avatar'],
    include: {
      model: Tweet,
      required: true,
      where: {
        userId: {
          [Op.in]: following,
        },
      },
    },
    raw: true,
  });
  return tweets;
};

// export const getRetweets = async (following) => {
//   const tweetIds = `SELECT Tweets.id from Tweets INNER JOIN Retweets ON Tweets.id = Retweets.tweetId WHERE Retweets.userId IN (${
//     following.length ? following.map((el) => "'" + el + "'").toString() : null
//   })`;
//   const tweets = await User.findAll({
//     attributes: ['firstname', 'lastname', 'username', 'avatar'],
//     include: {
//       model: Tweet,
//       required: true,
//       where: {
//         id: {
//           [Op.in]: sequelize.literal(`(${tweetIds})`),
//         },
//       },
//     },
//     raw: true,
//   });
//   return tweets;
// };

export const getRetweets = async (following) => {
  try {
    const tweets = await User.findAll({
      attributes: ['firstname', 'lastname', 'username', 'avatar'],
      include: {
        model: Tweet,
        required: true,
        include: {
          model: Retweet,
          attributes: [],
          where: {
            userId: {
              [Op.in]: following,
            },
          },
        },
      },
      raw: true,
    });

    return tweets;
  } catch (error) {
    console.error(error);
    // Handle the error appropriately
  }
};

// export const getLikes = async (following) => {
//   const tweetIds = `SELECT Tweets.id from Tweets INNER JOIN Likes ON Tweets.id = Likes.tweetId WHERE Likes.userId IN (${
//     following.length ? following.map((el) => "'" + el + "'").toString() : null
//   })`;
//   const tweets = await User.findAll({
//     attributes: ['firstname', 'lastname', 'username', 'avatar'],
//     include: {
//       model: Tweet,
//       required: true,
//       where: {
//         id: {
//           [Op.in]: sequelize.literal(`(${tweetIds})`),
//         },
//       },
//     },
//     raw: true,
//   });
//   return tweets;
// };


export const getLikes = async (following) => {
  try {
    const tweets = await User.findAll({
      attributes: ['firstname', 'lastname', 'username', 'avatar'],
      include: {
        model: Tweet,
        required: true,
        include: {
          model: Like,
          attributes: [],
          where: {
            userId: {
              [Op.in]: following,
            },
          },
        },
      },
      raw: true,
    });

    return tweets;
  } catch (error) {
    console.error(error);
    // Handle the error appropriately
  }
};