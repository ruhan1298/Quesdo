// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../../model/index';
import { v4 as uuidv4 } from 'uuid';
import { Default } from 'sequelize-typescript';
// import AddCarsPost from '../models/AddCarsPost';

interface SubCategoryDataAttributes {
  id?: number; // Use string type for UUID
  category_id?: number;
  Name?: string;
  image?: string;
 

  
 

}

class SubCategory extends Model<SubCategoryDataAttributes> {
    id!: number; // Use string type for UUID
    category_id!: number;
    Name!: string;
    image!: string;
  

    // role!:string;
    // permissions!: string[]; // Store allowed actions


   

}

SubCategory.init(
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
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
 

      },
     image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
  

  },
  {
    sequelize,
    modelName: 'SubCategory',
  }
);



// // // AddCarsPost.belongsTo(Favourite, { foreignKey: 'car_id' });
// SubCategory.belongsTo(Category, {
//     foreignKey: 'category_id',
//     as: 'category', // optional alias
//   });
export default SubCategory;
