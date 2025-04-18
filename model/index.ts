// src/models/index.ts
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  dialect: 'mysql',
  logging: false,
});

// Import models *after* initializing sequelize
import Category from '../Admin/models/category';
import SubCategory from '../Admin/models/subcategory';
import User from '../User/models/user';
import Interests from '../User/models/Interests';
import Post from '../User/models/post';
import Group from '../User/models/GroupMember'; // Import Group model
import Report from '../User/models/Report';

// Setup associations AFTER model definitions
// Category -> SubCategory
Category.hasMany(SubCategory, { foreignKey: 'category_id', as: 'subcategories' });
SubCategory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' }); // ✅ Add alias
Post.hasOne(Group, { foreignKey: 'postId', as: 'group' });
Group.belongsTo(Post, { foreignKey: 'postId', as: 'group' });
// In Post model
Post.belongsTo(User, { foreignKey: "userId", as: "user" });

// In User model (optional, for reverse access)
User.hasMany(Post, { foreignKey: "userId" });
// User -> Interests
User.hasMany(Interests, { foreignKey: 'userId', as: 'interests' });
Interests.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Interests -> SubCategory
Interests.belongsTo(SubCategory, { foreignKey: 'subcategoryId', as: 'subcategory' }); // ✅ Add this if not yet added


Report.belongsTo(User, { as: 'reporterUser', foreignKey: 'reporterId' });
Report.belongsTo(User, { as: 'reportedUser', foreignKey: 'reportedId' });

// Association with Post (Post associated with a Report)
Report.belongsTo(Post, { as: 'post', foreignKey: 'postId' });

// If you have subcategories table


export {
  sequelize,
  Category,
  SubCategory,
  User,
  Interests,
  Post,
  Group,
  Report,
};
export default sequelize;
