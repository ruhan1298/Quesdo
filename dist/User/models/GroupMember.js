"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/GroupMember.ts
const sequelize_1 = require("sequelize");
const index_1 = require("../../model/index");
class GroupMember extends sequelize_1.Model {
}
GroupMember.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    postId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    createdBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    members: {
        type: sequelize_1.DataTypes.JSON, // Now array of objects with userId + status
        allowNull: false,
        defaultValue: [],
    },
    maxSize: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    endAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    isArchive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: index_1.sequelize,
    modelName: 'GroupMember',
});
exports.default = GroupMember;
