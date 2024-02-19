import { DataTypes, Sequelize } from "sequelize";

export default (sequelize) => {
  return sequelize.define("blacklists", {
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  });
};
