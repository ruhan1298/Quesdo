"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// models/ShowRoomUser.ts
const sequelize_1 = require("sequelize");
const index_1 = require("../../model/index");
class Interests extends sequelize_1.Model {
}
Interests.init({
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
    }
}, {
    sequelize: index_1.sequelize,
    modelName: 'Interests',
});
exports.default = Interests;
