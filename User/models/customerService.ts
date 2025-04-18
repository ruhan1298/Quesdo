// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../model/index';


interface CustomerServiceAttributes  {
    id?: number; // Use string type for UUID
    name?: string;
    email?:string;
    phoneNumber?:string
    userId?:string
    subject?:string
    Description?:string
    isReply?:boolean
   


  
 

}

class customerService extends Model<CustomerServiceAttributes > {
    id!: number; // Use string type for UUID
    name!: string;
    email!:string;
    phoneNumber!:string
    userId!:string
    subject!:string
    Description!:string
    isReply!:boolean
   

}

customerService.init(
  {
   
    id: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
    
        allowNull: false,
        primaryKey: true,
      },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email:{
        type:DataTypes.STRING,
allowNull:true
      },
      subject:{
        type:DataTypes.STRING,
        allowNull:true
      },
      Description:{
        type:DataTypes.TEXT,
        allowNull:true
      },
      isReply:{
        type:DataTypes.BOOLEAN,
        defaultValue:false

      },
      userId:{  
        type:DataTypes.STRING,
        allowNull:true
      },
        phoneNumber:{
            type:DataTypes.STRING,
            allowNull:true
        },

//       isReply:{  
    
 
  

  },
  {
    sequelize,
    modelName: 'customerService',
  }
);

export default customerService
