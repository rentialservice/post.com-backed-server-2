import { Sequelize, DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Follower', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
    },
    followed: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    follower: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  });
};
