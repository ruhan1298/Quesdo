"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/ShowRoomUser.ts
const sequelize_1 = require("sequelize");
const index_1 = require("../../model/index");
class Post extends sequelize_1.Model {
}
Post.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER, // Change this to UUID
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    subcategoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID, // ✅ match type with User.id
        allowNull: true,
    },
    Title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    GroupSize: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    Time: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    Description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    Location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    Latitude: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    Longitude: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    IsAddAutomatically: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false, // Default value for IsAddAutomatically
    },
    IsOnRequest: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false, // Default value for IsOnRequest
    },
    IsBosted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false, // Default value for IsBosted
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isAvailablenow: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false, // Default value for IsBosted
    },
    isTodayOnly: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    ageRangeMin: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    ageRangeMax: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'archived', 'closed'),
        defaultValue: "active"
    },
    endTime: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    sequelize: index_1.sequelize,
    modelName: 'Post',
});
exports.default = Post;
