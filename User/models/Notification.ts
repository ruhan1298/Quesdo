import { Model, DataTypes } from 'sequelize';
import sequelize from '../../model/index';
import { v4 as uuidv4 } from 'uuid';
import { Default } from 'sequelize-typescript';
import { types } from 'util';
// import AddCarsPost from '../models/AddCarsPost';

interface notificationAttributes {
  id?: number; // Use string type for UUID
  type?: string;
 title?:string
 body?:string
 userId?:string
moduleId?:string
// userType?:string
isRead?:boolean
senderId?:string
  
 

}

class Notification extends Model<notificationAttributes> {
    id!: number; // Use string type for UUID
    type!: string;
    title!:string
    body!:string
    userId!:string
   moduleId!:string
//    userType!:string
   isRead!:boolean
   senderId!:string
     
   

}

Notification.init(
  
    {
      id: {
          type: DataTypes.INTEGER,
          primaryKey: true, // Primary key ensures uniqueness
          autoIncrement: true, // Auto-increment for numeric IDs
      },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userId:{
        type:DataTypes.STRING,
        allowNull:true
      },
      
      moduleId:{
        type:DataTypes.STRING,
        allowNull:true
      },
      title:{
        type:DataTypes.STRING,
        allowNull:true
      },
      body:{
        type:DataTypes.STRING,
        allowNull:true
      },
     
      isRead:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
      },
      senderId:{
        type:DataTypes.STRING,
    allowNull:true
      }
  
  

  },
  {
    sequelize,
    modelName: 'notification',
  }
);
// AddCarsPost.belongsTo(Favourite, { foreignKey: 'car_id' });

export default Notification;
