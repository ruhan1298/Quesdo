// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../../model/index';

interface AdminAttributes {
  id?: number; // Use string type for UUID
  fullName?: string;
  image?: string;
  email?:string;
  mobilenumber?:string
  password?:string
  resetPasswordToken?:string
    resetPasswordExpires?:Date


  
 

}

class Admin extends Model<AdminAttributes> {
    id!: number; // Use string type for UUID
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
        type: DataTypes.INTEGER, // Change this to UUID
        allowNull: false,
        autoIncrement: true,
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
