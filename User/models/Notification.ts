import { Model, DataTypes } from 'sequelize';
import sequelize from '../../model/index';

interface NotificationAttributes {
  id?: number; // Use string type for UUID
  type?: string;
 title?:string
 body?:string
 userId?:string
moduleId?:string
// userType?:string
isRead?:boolean
senderId?:string
isActive?:boolean 
 

}

class Notification extends Model<NotificationAttributes> {
    id!: number; // Use string type for UUID
    type!: string;
    title!:string
    body!:string
    userId!:string
   moduleId!:string
//    userType!:string
   isRead!:boolean
   senderId!:string
    isActive!:boolean
     
   

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
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
      
  
  

  },
  {
    sequelize,
    modelName: 'notification',
  }
);

export default Notification;
