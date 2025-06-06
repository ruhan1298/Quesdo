"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/ShowRoomUser.ts
const sequelize_1 = require("sequelize");
const index_1 = require("../../model/index");
class Admin extends sequelize_1.Model {
}
Admin.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER, // Change this to UUID
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    fullName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    mobilenumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: sequelize_1.DataTypes.STRING
    },
    resetPasswordToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
}, {
    sequelize: index_1.sequelize,
    modelName: 'Admin',
});
exports.default = Admin;
