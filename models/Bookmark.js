import { DataTypes } from 'sequelize';

const defineBookmarkModel = (sequelize) => {
  return sequelize.define("Bookmark", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    tweetId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });
};

export default defineBookmarkModel;
