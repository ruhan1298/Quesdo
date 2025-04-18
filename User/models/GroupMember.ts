// models/GroupMember.ts
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../../model/index';

interface MemberDetail {
  userId: string;
  status: 'pending' | 'joined';
}

interface GroupMemberAttributes {
  id?: number;
  postId: number;
  createdBy: string;
  members?: MemberDetail[];
  maxSize: number;
}

class GroupMember extends Model<GroupMemberAttributes> implements GroupMemberAttributes {
  id!: number;
  postId!: number;
  createdBy!: string;
  members!: MemberDetail[];
  maxSize!: number;
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
  },
  {
    sequelize,
    modelName: 'GroupMember',
  }
);

export default GroupMember;
