// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../../model/index';

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

export default Interests
