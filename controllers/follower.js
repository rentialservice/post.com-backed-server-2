// New ECMAScript module syntax
import { User, Follower } from '../sequelize.js';

export const followUser = async (req, res) => {
  // body -> {followedId, followerId}
  const body = {
    followed: req.body.followedId,
    follower: req.body.followerId,
  };
  const alreadyFollowing = await Follower.findOne({
    where: body,
  });

  return alreadyFollowing
    ? res.status(200).json(await Follower.destroy({ where: body }))
    : res.status(200).json(await Follower.create(body));
};

export const getDetails = async (req, res) => {
  // body -> {id, myId}
  // Get Followers and Following
  const values = await Promise.all([
    getFollowers(req.query.id),
    getFollowing(req.query.id),
    getFollowers(req.query.myId),
    getFollowing(req.query.myId),
  ]);
  
  let followers = values[0];
  let following = values[1];
  const followersSet = new Set();
  const followingSet = new Set();
  values[2].map((item) => followersSet.add(item.id));
  values[3].map((item) => followingSet.add(item.id));
  followers = followers.map((item) => {
    let deepCopy = { ...item };
    if (followersSet.has(item.id)) deepCopy.isFollower = true;
    if (followingSet.has(item.id)) deepCopy.isFollowing = true;
    return deepCopy;
  });
  following = following.map((item) => {
    let deepCopy = { ...item };
    if (followersSet.has(item.id)) deepCopy.isFollower = true;
    if (followingSet.has(item.id)) deepCopy.isFollowing = true;
    return deepCopy;
  });
  return res.status(200).json({
    followers,
    following,
  });
};

export const getFollowers = async (id) => {
  const followers = await User.findAll({
    attributes: [
      'id',
      'firstname',
      'lastname',
      'username',
      'email',
      'avatar',
      'bio',
    ],
    include: {
      model: Follower,
      as: 'Followers',
      required: true,
      attributes: [],
      where: {
        followed: id,
      },
    },
    raw: true,
  });
  return followers;
};

export const getFollowing = async (id) => {
  const following = await User.findAll({
    attributes: [
      'id',
      'firstname',
      'lastname',
      'username',
      'email',
      'avatar',
      'bio',
    ],
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
  return following;
};
