// New ECMAScript module syntax
import { Op } from "sequelize";
import { Tweet, Bookmark, User, sequelize } from "../sequelize.js";
import { bookmarkValidation } from "../utils/validation.js";

export const tweetAttributes = [
  "id",
  "text",
  "media",
  "commentsCount",
  "retweetsCount",
  "likesCount",
  "createdAt",
];

export const getBookmarks = async (req, res) => {
  const tweetIds = `SELECT tweetId from Bookmarks where userId='${req.query.userId}'`;
  const tweets = await User.findAll({
    attributes: ["firstname", "lastname", "username", "avatar"],
    include: {
      model: Tweet,
      required: true,
      attributes: tweetAttributes,
      where: {
        id: {
          [Op.in]: sequelize.literal(`(${tweetIds})`),
        },
      },
    },
    order: [[Tweet, "createdAt", "DESC"]],
    raw: true,
  });
  return res.status(200).json({ tweets });
};

export const addBookmark = async (req, res) => {
  const validation = bookmarkValidation(req.body);
  if (validation.error)
    return res.status(400).json({ errors: validation.error.details });

  const [bookmark, created] = await Bookmark.findOrCreate({
    where: req.body,
    defaults: req.body,
  });

  if (!created)
    return res.status(403).json({ errors: "Tweet is already in the bookmark list" });

  return res.status(200).json({ bookmark });
};

export const removeBookmark = async (req, res) => {
  const validation = bookmarkValidation(req.body);
  if (validation.error)
    return res.status(400).json({ errors: validation.error.details });
  const remBookmark = await Bookmark.destroy({
    where: req.body,
  });

  if (remBookmark == 0)
    return res
      .status(403)
      .json({ errors: "Tweet is already not in the boomark list" });

  return res.status(200).json({ remBookmark });
};

