import { DataTypes } from 'sequelize';

const defineRetweetModel = (sequelize) => {
  return sequelize.define('retweet', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    tweetId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });
};

export default defineRetweetModel;
