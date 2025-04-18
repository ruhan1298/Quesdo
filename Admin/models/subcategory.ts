// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../../model/index';

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




export default SubCategory;
