"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/ShowRoomUser.ts
const sequelize_1 = require("sequelize");
const index_1 = require("../../model/index");
class CustomerService extends sequelize_1.Model {
}
CustomerService.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    subject: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    Description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    isReply: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    userId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    //       isReply:{  
}, {
    sequelize: index_1.sequelize,
    modelName: 'customerService',
});
exports.default = CustomerService;
