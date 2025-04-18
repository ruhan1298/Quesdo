// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../../model/index';

interface AdminAttributes {
  id?: string; // Use string type for UUID
  fullName?: string;
  image?: string;
  email?:string;
  mobilenumber?:string
  password?:string
  resetPasswordToken?:string
    resetPasswordExpires?:Date


  
 

}

class Admin extends Model<AdminAttributes> {
    id!: string; // Use string type for UUID
    fullName!: string;
    image!: string;
    email!:string;
    mobilenumber!:string;
    password!:string;
    resetPasswordToken!:string
    resetPasswordExpires!:Date




   

}

Admin.init(
  {
   
    id: {
        type: DataTypes.UUID, // Change this to UUID
        defaultValue: DataTypes.UUIDV4, // Automatically generate UUID
        allowNull: false,
        primaryKey: true,
      },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fullName:{
        type:DataTypes.STRING,
        allowNull:true
      },
      mobilenumber:{
        type:DataTypes.STRING,
        allowNull:true

      },
      password:{
        type:DataTypes.STRING,
        allowNull:true 
      },
      email:{
        type:DataTypes.STRING
      },
        resetPasswordToken:{
            type:DataTypes.STRING,
            allowNull:true
        },
        resetPasswordExpires:{
            type:DataTypes.DATE,
            allowNull:true
        },

  

  },
  {
    sequelize,
    modelName: 'Admin',
  }
);

export default Admin;
