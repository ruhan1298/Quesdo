// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../../model/index';
import { v4 as uuidv4 } from 'uuid';
import { Default } from 'sequelize-typescript';
// import SubCategory from './subcategory';

// import { Default } from 'sequelize-typescript';
// import AddCarsPost from '../models/AddCarsPost';

interface CategoryDataAttributes {
  id?: number; // Use string type for UUID
  Name?: string;
 

  
 

}

class Category extends Model<CategoryDataAttributes> {
    id!: number; // Use string type for UUID
    Name!: string;
  

    // role!:string;
    // permissions!: string[]; // Store allowed actions


   

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
// AddCarsPost.belongsTo(Favourite, { foreignKey: 'car_id' });

export default Category;
