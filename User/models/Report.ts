// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import {sequelize} from '../../model/index';
import { v4 as uuidv4 } from 'uuid';

interface ReportAttributes {
  id?: number; // Use string type for UUID
    reporterId?: string;
    reportedId?: string;
    reason?: string;
    groupId?: number;
    postId?: number;


 

  
 

}

class Report extends Model<ReportAttributes > {
    id!: number; // Use string type for UUID
    reporterId!: string;
    reportedId!: string;
    reason!: string;
    groupId!: number;
    postId!: number;
  

    // role!:string;
    // permissions!: string[]; // Store allowed actions


   

}

Report.init(
    {
        id: {
          type: DataTypes.INTEGER, // Change this to UUID
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // Auto-incrementing primary key
        },
        reporterId: {
          type: DataTypes.UUID,
          allowNull: false, // Make this required if you expect every report to have a reporter
          references: {
            model: 'Users', // Assuming you're referencing the Users table
            key: 'id',
          },
          onDelete: 'SET NULL', // Set reporterId to null if the related user is deleted
          onUpdate: 'CASCADE', // Update the reporterId if the related user ID changes
        },
        reportedId: {
          type: DataTypes.UUID,
          allowNull: false, // Make this required if every report has a reported user
          references: {
            model: 'Users', // Assuming you're referencing the Users table
            key: 'id',
          },
          onDelete: 'SET NULL', // Set reportedId to null if the related user is deleted
          onUpdate: 'CASCADE', // Update the reportedId if the related user ID changes
        },
        reason: {
          type: DataTypes.STRING,
          allowNull: true, // Optional reason field
        },
        groupId: {
          type: DataTypes.INTEGER,
          allowNull: true, // Optional field for categorizing reports
        },
        postId: {
          type: DataTypes.INTEGER,
          allowNull: true, // Optional field for linking to a post
        }
      },
  {
    sequelize,
    modelName: 'Report',
  }
);

export default Report
