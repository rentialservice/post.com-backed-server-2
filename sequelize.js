import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";
import UserModel from "./models/User.js";
import FollowerModel from "./models/Follower.js";
import TweetModel from "./models/Tweet.js";
import RetweetModel from "./models/Retweet.js";
import LikeModel from "./models/Like.js";
import CommentModel from "./models/Comment.js";
import BookmarkModel from "./models/Bookmark.js";
import ChatModel from "./models/Chat.js"
import AdminModel from "./models/admin/admin.js";
import RoleModel from "./models/admin/roles.js";
import PermissionModel from "./models/admin/permissions.js";
import BlackListModel from "./models/token/blacklist.js"

const { PG_DATABASE, PG_USERNAME, PG_PASSWORD, PG_HOST, PG_PORT } = process.env;

const sequelize = new Sequelize(PG_DATABASE, PG_USERNAME, PG_PASSWORD, {
  logging: false,
  host:PG_HOST,
  port:PG_PORT,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

try {
  await sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

const User = UserModel(sequelize);
const Follower = FollowerModel(sequelize);
const Tweet = TweetModel(sequelize);
const Retweet = RetweetModel(sequelize);
const Like = LikeModel(sequelize);
const Comment = CommentModel(sequelize);
const Bookmark = BookmarkModel(sequelize);
const Chat= ChatModel(sequelize);
const Admin = AdminModel(sequelize);
const Role = RoleModel(sequelize);
const Permission = PermissionModel(sequelize);
const Blacklist = BlackListModel(sequelize);

// User -> Follower association
User.hasMany(Follower, { as: "Followers", foreignKey: "follower" });
User.hasMany(Follower, { as: "Following", foreignKey: "followed" });

// User -> Tweet association
User.hasMany(Tweet, { foreignKey: "userId" });

// User -> Like association
User.hasMany(Like, { foreignKey: "userId" });

// User -> Retweet association
User.hasMany(Retweet, { foreignKey: "userId" });

// Tweet -> Like association
Tweet.hasMany(Like, { foreignKey: "tweetId" });

// Tweet -> Retweet association
Tweet.hasMany(Retweet, { foreignKey: "tweetId" });

// User -> Comment association
User.hasMany(Comment, { foreignKey: "userId" });

// Tweet -> Bookmark association
Tweet.hasMany(Bookmark, { foreignKey: "tweetId" });
User.hasMany(Bookmark, { foreignKey: "userId" });

// User -> Chat association
Chat.belongsTo(User, { foreignKey: 'senderId', as: 'sender' }); // A Chat belongs to a User as a sender
Chat.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });


// Role > Admin
Role.hasMany(Admin, { foreignKey: "roleId" });
Admin.belongsTo(Role, { foreignKey: "roleId" })

// Role <> Permission
Role.belongsToMany(Permission, { through: "rolePermissions", foreignKey: "roleId" });
Permission.belongsToMany(Role, { through: "rolePermissions", foreignKey: "permissionId" });


// // set default permissions and roles
// const allPermissions = await Permission.bulkCreate([
//     { name: "admins", scope: "admin" },
//     { name: "products", scope: "product" },
//     { name: "subscriptions", scope: "subscription" },
// ]);

// const rootAdminRole = await Role.create({
//     name: "rootAdmin",
// });

// await rootAdminRole.addPermissions(allPermissions);


await sequelize.sync({ alter: true });
// await sequelize.sync({ force: true });

export { User, Follower, Tweet, Retweet, Like, Comment, Bookmark, Chat ,Admin,Permission,Role,Blacklist,sequelize};

