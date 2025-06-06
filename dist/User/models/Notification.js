"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const index_1 = __importDefault(require("../../model/index"));
class Notification extends sequelize_1.Model {
}
Notification.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true, // Primary key ensures uniqueness
        autoIncrement: true, // Auto-increment for numeric IDs
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    moduleId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    body: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    isRead: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    senderId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: index_1.default,
    modelName: 'notification',
});
exports.default = Notification;
