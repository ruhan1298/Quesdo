// models/GroupMember.ts
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../model/index';

interface MemberDetail {
  userId: string;
  status: 'pending' | 'joined';
  isArchive:boolean
}

interface GroupMemberAttributes {
  id?: number;
  postId: number;
  createdBy: string;
  members?: MemberDetail[];
  maxSize: number;
  endAt?:Date
  isArchive?:boolean
}

class GroupMember extends Model<GroupMemberAttributes> implements GroupMemberAttributes {
  id!: number;
  postId!: number;
  createdBy!: string;
  members!: MemberDetail[];
  maxSize!: number;
  endAt!:Date
  isArchive?: boolean ;
}

GroupMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    members: {
      type: DataTypes.JSON, // Now array of objects with userId + status
      allowNull: false,
      defaultValue: [],
    },
    maxSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    endAt:{
      type:DataTypes.DATE,
      allowNull:true
    },
    isArchive:{
      type:DataTypes.BOOLEAN,
      defaultValue:true
  
    }
  },
  {
    sequelize,
    modelName: 'GroupMember',
  }
);


export default GroupMember;
