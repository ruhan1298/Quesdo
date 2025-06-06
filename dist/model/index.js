"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = exports.GroupMember = exports.Post = exports.Interests = exports.User = exports.SubCategory = exports.Category = exports.sequelize = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = require("sequelize");
dotenv_1.default.config();
// Initialize Sequelize with PostgreSQL configuration
const sequelize = new sequelize_1.Sequelize({
    database: 'qesdo',
    username: 'qesdouser',
    password: 'eluUYkByn0AN5kHIsyJKlNXhB2YWMZoE',
    host: 'dpg-d118n4h5pdvs73enhjpg-a',
    port: 5432, // PostgreSQL default port
    dialect: 'postgres',
    logging: false,
});
exports.sequelize = sequelize;
// Import models *after* initializing sequelize
const category_1 = __importDefault(require("../Admin/models/category"));
exports.Category = category_1.default;
const subcategory_1 = __importDefault(require("../Admin/models/subcategory"));
exports.SubCategory = subcategory_1.default;
const user_1 = __importDefault(require("../User/models/user"));
exports.User = user_1.default;
const Interests_1 = __importDefault(require("../User/models/Interests"));
exports.Interests = Interests_1.default;
const post_1 = __importDefault(require("../User/models/post"));
exports.Post = post_1.default;
const Report_1 = __importDefault(require("../User/models/Report"));
exports.Report = Report_1.default;
const GroupMember_1 = __importDefault(require("../User/models/GroupMember"));
exports.GroupMember = GroupMember_1.default;
// Setup associations AFTER model definitions
// Category -> SubCategory
category_1.default.hasMany(subcategory_1.default, { foreignKey: 'category_id', as: 'subcategories' });
subcategory_1.default.belongsTo(category_1.default, { foreignKey: 'category_id', as: 'category' }); // ✅ Add alias
// Post -> GroupMember (used as group info)
// Post.hasOne(GroupMember, { foreignKey: 'postId', as: 'groupInfo' }); // or 'groupMeta', etc.
GroupMember_1.default.belongsTo(post_1.default, { foreignKey: 'postId', as: 'post' });
// Post -> GroupMembers (all members in a group)
post_1.default.hasMany(GroupMember_1.default, { foreignKey: 'postId', as: 'groupMembers' });
// GroupMember -> User
// In Post model
post_1.default.belongsTo(user_1.default, { foreignKey: "userId", as: "user" });
// In User model (optional, for reverse access)
user_1.default.hasMany(post_1.default, { foreignKey: "userId" });
// User -> Interests
user_1.default.hasMany(Interests_1.default, { foreignKey: 'userId', as: 'interests' });
Interests_1.default.belongsTo(user_1.default, { foreignKey: 'userId', as: 'user' });
// Interests -> SubCategory
Interests_1.default.belongsTo(subcategory_1.default, { foreignKey: 'subcategoryId', as: 'subcategory' }); // ✅ Add this if not yet added
Report_1.default.belongsTo(user_1.default, { as: 'reporterUser', foreignKey: 'reporterId' });
Report_1.default.belongsTo(user_1.default, { as: 'reportedUser', foreignKey: 'reportedId' });
// Association with Post (Post associated with a Report)
Report_1.default.belongsTo(post_1.default, { as: 'post', foreignKey: 'postId' });
subcategory_1.default.belongsTo(category_1.default, { foreignKey: 'category_id' });
exports.default = sequelize;
// src/models/index.ts
// import { Sequelize } from 'sequelize-typescript';
// import dotenv from 'dotenv';
// dotenv.config();
// const sequelize = new Sequelize({
//   database: process.env.DB_NAME!,
//   username: process.env.DB_USER!,
//   password: process.env.DB_PASSWORD!,
//   host: process.env.DB_HOST!,
//   port: parseInt(process.env.DB_PORT ?? '3306', 10),
//   dialect: 'mysql',
//   logging: false,
// });
// // Import models *after* initializing sequelize
// import Category from '../Admin/models/category';
// import SubCategory from '../Admin/models/subcategory';
// import User from '../User/models/user';
// import Interests from '../User/models/Interests';
// import Post from '../User/models/post';
// import Report from '../User/models/Report';
// import Notification from '../User/models/Notification';
// import GroupMember from '../User/models/GroupMember';
// // Setup associations AFTER model definitions
// // Category -> SubCategory
// Category.hasMany(SubCategory, { foreignKey: 'category_id', as: 'subcategories' });
// SubCategory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' }); // ✅ Add alias
// // Post -> GroupMember (used as group info)
// // Post.hasOne(GroupMember, { foreignKey: 'postId', as: 'groupInfo' }); // or 'groupMeta', etc.
// GroupMember.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
// // Post -> GroupMembers (all members in a group)
// Post.hasMany(GroupMember, { foreignKey: 'postId', as: 'groupMembers' });
// // GroupMember -> User
// // In Post model
// Post.belongsTo(User, { foreignKey: "userId", as: "user" });
// // In User model (optional, for reverse access)
// User.hasMany(Post, { foreignKey: "userId" });
// // User -> Interests
// User.hasMany(Interests, { foreignKey: 'userId', as: 'interests' });
// Interests.belongsTo(User, { foreignKey: 'userId', as: 'user' });
// // Interests -> SubCategory
// Interests.belongsTo(SubCategory, { foreignKey: 'subcategoryId', as: 'subcategory' }); // ✅ Add this if not yet added
// Report.belongsTo(User, { as: 'reporterUser', foreignKey: 'reporterId' });
// Report.belongsTo(User, { as: 'reportedUser', foreignKey: 'reportedId' });
// // Association with Post (Post associated with a Report)
// Report.belongsTo(Post, { as: 'post', foreignKey: 'postId' });
// SubCategory.belongsTo(Category, { foreignKey: 'category_id' });
// sequelize.models.Post.sync({ alter: true })
//   .then(() => {
//     console.log('Post model updated successfully!');
//   })
//   .catch((error) => {
//     console.error('Error syncing Post model:', error);
//   });
// sequelize.models.GroupMember.sync({ alter: true })
//   .then(() => {
//     console.log('GroupMember model updated successfully!');
//   })
//   .catch((error) => {
//     console.error('Error syncing GroupMember model:', error);
//   });
// // If you have subcategories table
// export {
//   sequelize,
//   Category,
//   SubCategory,
//   User,
//   Interests,
//   Post,
//   GroupMember,
//   Report,
// };
// export default sequelize;
