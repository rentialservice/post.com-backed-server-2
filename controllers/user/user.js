import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User, Blacklist, Tweet } from "../../sequelize.js";
import {
  validatePassword,
  validateUsername,
} from "../../utils/validation.js";
import {
  getMyRetweets,
  getMyLikes,
  getLikedTweets,
  getUserTweets,
  getUserRetweets,
} from "./globals.js";
import { putImage } from "../../utils/s3.js";
import { UserRepository } from "../../models/Repository/UserRepository.js";
import { imageCategory, getImageName } from "../../utils/common.js";

export const tweetAttributes = [
  "id",
  "text",
  "media",
  "commentsCount",
  "retweetsCount",
  "likesCount",
  "createdAt",
];

export const verifyOtp = async (req, res) => {
  const { otp, otpToken } = req.body;
  var hashedOtp = "";
  var email = "";
  var dob = "";
  var fullName = "";

  try {
    jwt.verify(otpToken, process.env.SECRET_KEY, (err, decoded) => {
      if (err) throw Error("OTP is expired...!");
      email = decoded.email;
      hashedOtp = decoded.hashedOtp;
      dob = decoded.dob;
      fullName = decoded.fullName;
    });

    // validation of otp
    var otpIsValid = bcrypt.compareSync(otp, hashedOtp);

    if (!otpIsValid) {
      return res.status(400).json({
        message: "Wrong OTP ...!",
        registeredUser: false,
        accessToken: "",
        refreshToken: "",
      });
    }

    // check if user exists
    const ExistingUser = await User.findOne({
      where: { email },
    });

    var newUser;
    if (ExistingUser) {
      throw Error("User is already registered ...!");
    } else {
      newUser = await User.create({
        email,
        fullName,
        dob,
      });
    }

    console.log(newUser.id);

    // Prepare a token.
    const accessToken = jwt.sign(
      {
        email,
        id:newUser.id
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      {
        email,
        id:newUser.id
      },
      process.env.SECRET_KEY,
      { expiresIn: "720h" }
    );

    res.status(200).json({
      message: "OTP verified successfully & User registered successfully",
      accessToken,
      refreshToken,
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const setUsername = async (req, res) => {
  const { username } = req.body;
  const { id } = req.query;

  try {
    const isValidUsername = validateUsername(username);
    if (!isValidUsername) throw new Error("username is not valid");

    const isUserNameTaken = await User.findOne({
      where: { username },
    });

    if (isUserNameTaken)
      throw new Error("username is taken, please try another one ....!");
    await User.update(
      { username: username },
      {
        where: { id: id },
      }
    );

    const updatedUser = await User.findOne({
      where: { id },
      attributes: ["username", "bio", "avatar", "cover", "dob", "tags"],
    });

    return res.status(200).json({
      status: "username set successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const setPassword = async (req, res) => {
  const { password } = req.body;
  const { id } = req.query;

  try {
    const isValidPassword = validatePassword(password);
    if (!isValidPassword)
      throw new Error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
      );

    let saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await User.update(
      { password: hashedPassword },
      {
        where: { id: id },
      }
    );

    const updatedUser = await User.findOne({
      where: { id },
      attributes: ["username", "bio", "avatar", "cover", "dob", "tags"],
    });

    return res.status(200).json({
      status: "Password set successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addBioTags = async (req, res) => {
  const { id } = req.query;

  try {
    const userData = await User.findOne({
      where: { id: id },
    });

    const obj = {
      bio: req.body.bio ? req.body.bio : userData.bio,
      tags: req.body.tags ? req.body.tags : userData.tags,
    };

    const user = await User.update(obj, {
      where: { id: id },
    });

    const updatedUser = await User.findOne({
      where: { id: id },
      attributes: ["username", "bio", "avatar", "cover", "dob", "tags"],
    });
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    return res.status(400).json({ errors: error.message });
  }
};

export const addInterest = async (req, res) => {
  const { id } = req.query;

  try {
    const userData = await User.findOne({
      where: { id: id },
    });

    const obj = {
      interest: req.body.interest ? req.body.interest : userData.interest,
    };

    const user = await User.update(obj, {
      where: { id: id },
    });

    const updatedUser = await User.findOne({
      where: { id: id },
      attributes: ["username", "bio", "avatar", "cover", "dob", "tags","interest"],
    });
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    return res.status(400).json({ errors: error.message });
  }
};

export const fetchUserFeedRandom = async (req, res) => {

  const { id } = req.query;
  try {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error("User not found");
    }

    const tweets = await Tweet.findAll({
      where: {
        categories: {
          [Sequelize.Op.overlap]: user.interest,
        },
      },
      order: [['createdAt', 'DESC']], // Adjust as needed
    });

    res.status(200).json({
      message: "Random tweets for user with respect to interest chosen by user",
      tweets,
    });
  } catch (error) {
    console.error("Error fetching user feed:", error.message);
    res.status(400).json({ error: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Access token required" });
  }
  const accessToken = authorization;
  var email = "";

  try {
    jwt.verify(accessToken, process.env.SECRET_KEY, (err, decoded) => {
      if (err) throw Error("Access Token is not valid...!");
      email = decoded.email;
    });

    // check if user exists
    const userDetails = await User.findOne({
      where: {
        email,
      },
    });

    res.status(200).json({
      message: "User details fetched successfully",
      userDetails,
    });
  } catch (error) {
    // console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const editUser = async (req, res) => {
  // body -> {fullName, dob, media}
  // console.log("files", req.files);
  const { id } = req.query;
  const avatar = req.files.avatar ? req.files.avatar[0] : null;
  const cover = req.files.cover ? req.files.cover[0] : null;

  try {
    const avatarURL = avatar
      ? await putImage(
          getImageName(avatar.originalname),
          imageCategory.avatar,
          avatar.buffer,
          avatar.mimetype
        )
      : null;
    const coverURL = cover
      ? await putImage(
          getImageName(cover.originalname),
          imageCategory.cover,
          cover.buffer,
          cover.mimetype
        )
      : null;

    const userData = await User.findOne({
      where: { id: id },
    });

    const obj = {
      fullName: req.body.fullName ? req.body.fullName : userData.fullName,
      bio: req.body.bio ? req.body.bio : userData.bio,
      location: req.body.location ? req.body.location : userData.location,
      dob: req.body.dob ? req.body.dob : userData.dob,
    };
    console.log("obj", obj);
    if (avatarURL) obj.avatar = avatarURL;
    if (coverURL) obj.cover = coverURL;

    const user = await User.update(obj, {
      where: { id: id },
    });

    const updatedUser = await User.findOne({
      where: { id: req.body.userId },
      attributes: [
        "firstname",
        "lastname",
        "username",
        "bio",
        "avatar",
        "cover",
        "location",
        "dob",
      ],
    });
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    return res.status(400).json({ errors: error });
  }
};

export const loginUser = async (req, res) => {
  const user = await User.findOne({
    where: {
      [Sequelize.Op.or]: [{ username: req.body.user }, { email: req.body.user }],
    },
    raw: true,
  });
  if (!user) return res.status(401).json({ user: "Incorrect username/email" });

  const match = await bcrypt.compare(req.body.password, user.password);
  if (!match) return res.status(401).json({ password: "Incorrect password" });

    // Prepare a token.
    const accessToken = jwt.sign(
      {
        email:req.body.email,
        id:user.id
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      {
        email:req.body.email,
        id:user.id
      },
      process.env.SECRET_KEY,
      { expiresIn: "720h" }
    );


  return res.status(200).json({
    user: {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      avatar: user.avatar,
      cover: user.cover,
      dob: user.dob,
      bio: user.bio,
      accessToken,
      refreshToken,
    },
  });
};

export const getUserByUsername = async (req, res) => {
  const user = await User.findOne({
    attributes: [
      "id",
      "fullName",
      "username",
      "bio",
      "avatar",
      "cover",
      "dob",
      "createdAt",
    ],
    where: {
      username: req.query.username,
    },
  });
  return res.status(200).json(user);
};

export const getTweetsByUserId = async (req, res) => {
  // body -> {userId, myId}
  /* 
    1. Get tweets, retweets made by user. Get tweetIds retweeted and liked by me
    2. Add tweetIds of retweets and likes in 2 Sets
    3. Map over all tweets to add selfRetweeted -> true and selfLiked -> true
  */
  const values = await Promise.all([
    await getUserTweets(req.query.userId, tweetAttributes),
    await getUserRetweets(req.query.userId, tweetAttributes),
    await getMyLikes(req.query.myId),
    await getMyRetweets(req.query.myId),
  ]);

  const likeSet = new Set();
  const retweetSet = new Set();
  values[2].map((tweet) => likeSet.add(tweet.tweetId));
  values[3].map((tweet) => retweetSet.add(tweet.tweetId));
  let retweets = values[1].map((retweet) => ({
    ...retweet,
    isRetweet: true,
  }));
  let tweets = values[0].concat(retweets);
  const uniqueSet = new Set();
  tweets = tweets.filter((tweet) => {
    if (uniqueSet.has(tweet["Tweets.id"])) return false;
    uniqueSet.add(tweet["Tweets.id"]);
    return true;
  });
  tweets.sort(
    (a, b) => new Date(b["Tweets.createdAt"]) - new Date(a["Tweets.createdAt"])
  );

  tweets = tweets.map((tweet) => {
    let deepCopy = { ...tweet };
    if (retweetSet.has(tweet["Tweets.id"])) deepCopy.selfRetweeted = true;
    if (likeSet.has(tweet["Tweets.id"])) deepCopy.selfLiked = true;
    return deepCopy;
  });
  res.status(200).json({ tweets });
};

export const getMediaByUserId = async (req, res) => {
  try {
    const values = await Promise.all([
      await getUserTweets(req.query.userId, getMediaByUserId.tweetAttributes),
      await getUserRetweets(req.query.userId, getMediaByUserId.tweetAttributes),
      await getMyLikes(req.query.myId),
      await getMyRetweets(req.query.myId),
    ]);

    const likeSet = new Set();
    const retweetSet = new Set();
    values[2].map((tweet) => likeSet.add(tweet.tweetId));
    values[3].map((tweet) => retweetSet.add(tweet.tweetId));

    let retweets = values[1].map((retweet) => ({
      ...retweet,
      isRetweet: true,
    }));

    let tweets = values[0].concat(retweets);

    const uniqueSet = new Set();
    tweets = tweets.filter((tweet) => {
      if (uniqueSet.has(tweet["Tweets.id"])) return false;
      if (!tweet["Tweets.media"]) return false;
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

    res.status(200).json({ tweets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getLikesByUserId = async (req, res) => {
  try {
    const { userId, myId } = req.query;

    const values = await Promise.all([
      await getLikedTweets(userId, tweetAttributes),
      await getMyRetweets(myId),
      await getMyLikes(myId),
      await getMyRetweets(userId),
    ]);

    let likedTweets = values[0];
    console.log("likedTweets--> ", likedTweets);
    const retweetSet = new Set();
    const likeSet = new Set();
    const userRetweetSet = new Set();

    values[1].map((tweet) => retweetSet.add(tweet.tweetId));
    values[2].map((tweet) => likeSet.add(tweet.tweetId));
    values[3].map((tweet) => userRetweetSet.add(tweet.tweetId));

    likedTweets = likedTweets.map((tweet) => {
      let deepCopy = { ...tweet };
      if (retweetSet.has(tweet["Tweets.id"])) deepCopy.selfRetweeted = true;
      if (likeSet.has(tweet["Tweets.id"])) deepCopy.selfLiked = true;
      if (userRetweetSet.has(tweet["Tweets.id"])) deepCopy.isRetweet = true;
      return deepCopy;
    });

    return res.status(200).json({ tweets: likedTweets });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// to get the other user except the user itself
export const userDashboard = async (req, res) => {
  const { id } = req.decoded.user;
  try {
    const users = await UserRepository.findAllUsersExceptCurrentUser(id);
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No other users found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User chats found successfully",
      data: users,
    });
  } catch (error) {
    console.log("error in userDashboard", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const UpdateUserStatus = async (req, res) => {
  const { id } = req.decoded.user;
  const { status } = req.body;
  try {
    const updatedStatus = await UserRepository.updateUserStatus(id, status);
    if (!updatedStatus) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
    });
  } catch (error) {
    console.log("error in UpdateUserStatus", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const newAccessTokenGeneration = async (req, res) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ error: "Refresh token required" });
    }
    const refreshToken = authorization.split(" ")[1];

    // extract data from jwt
    const data = jwt.verify(refreshToken, process.env.SECRET_KEY);
    if (!data.email && !data.id) throw Error("Invalid refresh token");

    const blacklistedRefreshToken = await Blacklist.findOne({
      where: { refreshToken: refreshToken },
    });

    if (blacklistedRefreshToken) throw Error("Refresh Token is expired");

    const newblacklistedRefreshToken = await Blacklist.create({
      refreshToken: refreshToken,
    });

    if (!newblacklistedRefreshToken) throw Error("Something went wrong...!");

    const newAccessToken = jwt.sign(
      {
        email: data.email,
        id: data.id,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    const newRefreshToken = jwt.sign(
      {
        email: data.email,
        id: data.id,
      },
      process.env.SECRET_KEY,
      { expiresIn: "720h" }
    );

    // Send a response.
    res.status(200).json({
      message:
        "You have been successfully generated new access token and new refresh token",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
