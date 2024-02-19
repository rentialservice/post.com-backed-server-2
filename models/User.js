import { DataTypes } from 'sequelize';

const defineUserModel = (sequelize) => {
  return sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING
    },
    username: {
      type: DataTypes.STRING,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: 'https://res.cloudinary.com/twitter-clone-media/image/upload/v1597737557/user_wt3nrc.png'
    },
    cover: {
      type: DataTypes.STRING
    },
    bio: {
      type: DataTypes.STRING
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    interest: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    dob: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "offline",
    },
    lastSeen: {
      type: DataTypes.DATE,
    },
  });
};

export default defineUserModel;
