import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import {sequelize} from './model/index';  // Import the sequelize instance from the models directory
import cors from 'cors'
import { notificationQueue } from './middleware/notificationQueue'

import { startNotificationWorker } from './middleware/notificationworker';
import dotenv from 'dotenv';
dotenv.config();

import UserRouter from './User/routes/auth';
import AdminRouter from './Admin/routes/auth';


startNotificationWorker()
// scheduleEmailsForUsers()
//   .then(() => console.log('✅ Email scheduling initiated.'))
//   .catch((err) => console.error('❌ Error scheduling emails:', err));


const app = express();



// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static("uploads"));
app.use(cors());
import Admin from './Admin/models/auth';
Admin.sync({alter:true})
import User from './User/models/user';
User.sync({alter:true})

import Report from './User/models/Report';
Report.sync({alter:true})

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

app.use('/api/v1/user', UserRouter);
app.use('/api/v1/admin', AdminRouter);



sequelize.sync().then(() => {
  console.log('Database connected');
}).catch((error: Error) => {  // Explicitly type `error` as `Error`
  console.error('Failed to sync database:', error);
});


// Error handler


// Start the server directly in `app.ts`
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


export default app;
