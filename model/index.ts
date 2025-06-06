import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();
// Initialize Sequelize with PostgreSQL configuration
const sequelize = new Sequelize({
  database: 'qesdo',
  username: 'qesdouser',
  password: 'eluUYkByn0AN5kHIsyJKlNXhB2YWMZoE',
  host: 'dpg-d118n4h5pdvs73enhjpg-a',
  port: 5432, // PostgreSQL default port
  dialect: 'postgres',
  logging: false,
});

// Import models *after* initializing sequelize
import Category from '../Admin/models/category';
import SubCategory from '../Admin/models/subcategory';
import User from '../User/models/user';
import Interests from '../User/models/Interests';
import Post from '../User/models/post';
import Report from '../User/models/Report';
import Notification from '../User/models/Notification';
import GroupMember from '../User/models/GroupMember';

// Setup associations AFTER model definitions
// Category -> SubCategory
Category.hasMany(SubCategory, { foreignKey: 'category_id', as: 'subcategories' });
SubCategory.belongsTo(Category, { foreignKey: 'category_id', as: 'category' }); // ✅ Add alias
// Post -> GroupMember (used as group info)
// Post.hasOne(GroupMember, { foreignKey: 'postId', as: 'groupInfo' }); // or 'groupMeta', etc.
GroupMember.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Post -> GroupMembers (all members in a group)
Post.hasMany(GroupMember, { foreignKey: 'postId', as: 'groupMembers' });

// GroupMember -> User
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
SubCategory.belongsTo(Category, { foreignKey: 'category_id' });





// If you have subcategories table


export {
  sequelize,
  Category,
  SubCategory,
  User,
  Interests,
  Post,
  GroupMember,
  Report,
};
export default sequelize;
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
