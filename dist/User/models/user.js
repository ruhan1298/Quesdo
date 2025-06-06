"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/ShowRoomUser.ts
const sequelize_1 = require("sequelize");
const model_1 = require("../../model");
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID, // Change this to UUID
        defaultValue: sequelize_1.DataTypes.UUIDV4, // Automatically generate UUID
        allowNull: false,
        primaryKey: true,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    FirstName: {
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
    resetPasswordExpires: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    },
    resetPasswordToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    dob: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    gender: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    // interests:{
    //   type: DataTypes.JSON,// Use JSONB for PostgreSQL or JSON for MySQL
    //   allowNull: true,
    // },
    socialId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    socialType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    isCompletedProfile: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    reportNotification: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    inAppVibration: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    inAppSound: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    // Location Settings
    latitude: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    longitude: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    minDistanceKm: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 1,
    },
    maxDistanceKm: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 15,
    },
    ageRangeMin: {
        type: sequelize_1.DataTypes.INTEGER,
        // defaultValue: 18,
    },
    ageRangeMax: {
        type: sequelize_1.DataTypes.INTEGER,
        // defaultValue: 38,
    },
    showNowAvailable: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    // App-wide Settings
    pushNotification: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    eventUpdate: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    memories: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    deviceToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    deviceType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    isBlock: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: model_1.sequelize,
    modelName: 'User',
});
exports.default = User;
