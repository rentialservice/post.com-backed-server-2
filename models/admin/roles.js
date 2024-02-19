import { DataTypes,Sequelize } from "sequelize";

export default (sequelize)=>{
  return sequelize.define(
    "Role",
    {
      roleId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["name"],
        },
      ],
    }
  );
};
