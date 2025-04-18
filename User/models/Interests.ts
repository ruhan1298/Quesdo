// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../../model/index';
import { v4 as uuidv4 } from 'uuid';
import { Default } from 'sequelize-typescript';
// import SubCategory from './subcategory';

// import { Default } from 'sequelize-typescript';
// import AddCarsPost from '../models/AddCarsPost';

interface InterestsAttributes {
  id?: number; // Use string type for UUID
  Name?: string;
  subcategoryId?: number;
    userId?: string;

 

  
 

}

class Interests extends Model<InterestsAttributes > {
    id!: number; // Use string type for UUID
    subcategoryId!: number;
    userId!: string;
  

    // role!:string;
    // permissions!: string[]; // Store allowed actions


   

}

Interests.init(
  {
   
    id: {
        type: DataTypes.INTEGER, // Change this to UUID
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      
    subcategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userId: {
        type: DataTypes.UUID,  // ✅ match type with User.id
        allowNull: true,
      }
     
  

  },
  {
    sequelize,
    modelName: 'Interests',
  }
);
// AddCarsPost.belongsTo(Favourite, { foreignKey: 'car_id' });

export default Interests
