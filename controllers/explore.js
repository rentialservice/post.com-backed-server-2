// New ECMAScript module syntax
import { Op } from "sequelize";
import { User } from "../sequelize.js";

export const searchUser = async (req, res) => {
  const users = await User.findAll({
    attributes: ["id", "firstname", "lastname", "username", "avatar"],
    where: {
      [Op.or]: {
        firstname: {
          [Op.substring]: req.query.search,
        },
        lastname: {
          [Op.substring]: req.query.search,
        },
        username: {
          [Op.substring]: req.query.search,
        },
      },
    },
  });
  return res.status(200).json({ users });
};
