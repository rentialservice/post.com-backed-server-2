import { Sequelize, DataTypes } from "sequelize";

const defineFollowerModel = (sequelize) => {
  return sequelize.define("Like", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    tweetId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });
};

export default defineFollowerModel;
