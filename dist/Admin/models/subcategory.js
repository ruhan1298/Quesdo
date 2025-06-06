"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/ShowRoomUser.ts
const sequelize_1 = require("sequelize");
const index_1 = require("../../model/index");
class SubCategory extends sequelize_1.Model {
}
SubCategory.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER, // Change this to UUID
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    Name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    category_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: index_1.sequelize,
    modelName: 'SubCategory',
});
exports.default = SubCategory;
