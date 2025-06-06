// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../../model/index';

interface PostAttributes {
  id?: number; // Use string type for UUID
  Title?: string;
GroupSize?: number;
    Time?: string;
    Description?: string;
    Location?: string;
    subcategoryId?: number;
    Latitude?: string;
    Longitude?: string;
    userId?: string;  
    IsAddAutomatically?: boolean;
    IsOnRequest?: boolean;
  IsBosted?: boolean;
  isAvailablenow?: boolean;
  image?: string;
  isTodayOnly?:boolean
  ageRangeMax?:number
ageRangeMin?:number
    status?:'active' | 'archived' | 'closed'
endTime?:string
date?:Date

 

  
 

}

class Post extends Model<PostAttributes > {
    id!: number; // Use string type for UUID
    Title!: string;
    GroupSize!: number;
    Time!: string;
    Description!: string;
    Location!: string;
    Latitude!: string;
    Longitude!: string;
    IsAddAutomatically!: boolean;
    IsOnRequest!: boolean;
    IsBosted!: boolean;

    subcategoryId!: number;
    userId!: string;
    image!: string;
    isAvailablenow!: boolean;
    isTodayOnly!:boolean
    ageRangeMax!:number
ageRangeMin!:number
  
    status!:'active' | 'archived' | 'closed'

    endTime!:string
    date!:Date
  

    // role!:string;
    // permissions!: string[]; // Store allowed actions


   

}

Post.init(
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
      },
    Title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    GroupSize: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    Time: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    Description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    Location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    Latitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    Longitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    IsAddAutomatically: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false, // Default value for IsAddAutomatically
      },
    IsOnRequest: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false, // Default value for IsOnRequest
      },
    IsBosted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false, // Default value for IsBosted
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isAvailablenow: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false, // Default value for IsBosted
      },
      isTodayOnly:{
        type:DataTypes.BOOLEAN,
        allowNull:true,
        defaultValue:false

      },
      ageRangeMin:{
        type:DataTypes.INTEGER,
        allowNull:true,

      },
      ageRangeMax:{
        type:DataTypes.INTEGER,
        allowNull:true
      },
     
      status:{
        type:DataTypes.ENUM('active','archived','closed'),
        defaultValue:"active"
      },
      endTime:{
        type:DataTypes.STRING,
        allowNull:true
      },
      date:{
        type:DataTypes.DATEONLY,
        allowNull:true
      }



     
  

  },
  {
    sequelize,
    modelName: 'Post',
  }
);

export default Post;
