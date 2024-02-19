import { Sequelize,DataTypes } from 'sequelize';

export default (sequelize)=>{
  return sequelize.define('Chat',{
    id:{
      type:DataTypes.UUID,
      primaryKey:true,
      defaultValue:Sequelize.UUIDV4,
    },
    senderId:{
      type:DataTypes.UUID,
      allowNull:false,
    },
    receiverId:{
      type:DataTypes.UUID,
      allowNull:false,
    },
    message:{
      type:DataTypes.STRING(1000),
      allowNull:false,
    },
    status:{
      type:DataTypes.ENUM('sent','received','seen'),
      allowNull:false,
      defaultValue:'sent',
    },
  });
}
