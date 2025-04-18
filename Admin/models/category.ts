// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../../model/index';

interface CategoryDataAttributes {
  id?: number; // Use string type for UUID
  Name?: string;
 

  
 

}

class Category extends Model<CategoryDataAttributes> {
    id!: number; // Use string type for UUID
    Name!: string;


   

}

Category.init(
  {
   
    id: {
        type: DataTypes.INTEGER, // Change this to UUID
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
    Name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
     
  

  },
  {
    sequelize,
    modelName: 'Category',
  }
);

export default Category;
