"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const index_1 = require("./model/index"); // Import the sequelize instance from the models directory
const cors_1 = __importDefault(require("cors"));
const notificationworker_1 = require("./middleware/notificationworker");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const auth_1 = __importDefault(require("./User/routes/auth"));
const auth_2 = __importDefault(require("./Admin/routes/auth"));
(0, notificationworker_1.startNotificationWorker)();
// scheduleEmailsForUsers()
//   .then(() => console.log('✅ Email scheduling initiated.'))
//   .catch((err) => console.error('❌ Error scheduling emails:', err));
const app = (0, express_1.default)();
// View engine setup
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use("/uploads", express_1.default.static("uploads"));
app.use((0, cors_1.default)());
const auth_3 = __importDefault(require("./Admin/models/auth"));
auth_3.default.sync({ alter: true });
const user_1 = __importDefault(require("./User/models/user"));
user_1.default.sync({ alter: true });
const Report_1 = __importDefault(require("./User/models/Report"));
Report_1.default.sync({ alter: true });
// Sync model with PostgreSQL DB
// Admin.sync({ force: true })
//   .then(() => {
//     console.log('Admin model synced successfully with PostgreSQL.');
//   })
//   .catch((error) => {
//     console.error('Error syncing Admin model:', error);
//   });
// // import index from './models/index'
// // User.sync({alter: true})
// // Category.sync({alter:true})
// import Notification from './User/models/Notification';
// // Notification.sync({alter:true})
// import Post from './model/index';
// import User from './User/models/user';
// // User.sync({alter:true})
// import GroupMember from './model/index';
app.use('/api/v1/user', auth_1.default);
app.use('/api/v1/admin', auth_2.default);
index_1.sequelize.sync().then(() => {
    console.log('Database connected');
}).catch((error) => {
    console.error('Failed to sync database:', error);
});
// Error handler
// Start the server directly in `app.ts`
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
exports.default = app;
