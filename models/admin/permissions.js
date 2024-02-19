import { DataTypes ,Sequelize} from "sequelize";

export default (sequelize)=>{
  return sequelize.define(
    "Permission",
    {
      permissionId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      scope: {
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
      timestamps: false,
    }
  );
};
