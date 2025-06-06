"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/ShowRoomUser.ts
const sequelize_1 = require("sequelize");
const index_1 = require("../../model/index");
class Report extends sequelize_1.Model {
}
Report.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER, // Change this to UUID
        allowNull: false,
        primaryKey: true,
        autoIncrement: true, // Auto-incrementing primary key
    },
    reporterId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false, // Make this required if you expect every report to have a reporter
        references: {
            model: 'Users', // Assuming you're referencing the Users table
            key: 'id',
        },
        onDelete: 'SET NULL', // Set reporterId to null if the related user is deleted
        onUpdate: 'CASCADE', // Update the reporterId if the related user ID changes
    },
    reportedId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false, // Make this required if every report has a reported user
        references: {
            model: 'Users', // Assuming you're referencing the Users table
            key: 'id',
        },
        onDelete: 'SET NULL', // Set reportedId to null if the related user is deleted
        onUpdate: 'CASCADE', // Update the reportedId if the related user ID changes
    },
    reason: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true, // Optional reason field
    },
    groupId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // Optional field for categorizing reports
    },
    postId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // Optional field for linking to a post
    }
}, {
    sequelize: index_1.sequelize,
    modelName: 'Report',
});
exports.default = Report;
