import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import {sequelize} from './model/index';  // Import the sequelize instance from the models directory
import cors from 'cors'

import dotenv from 'dotenv';
dotenv.config();

import UserRouter from './User/routes/auth';
import AdminRouter from './Admin/routes/auth'
import User from './User/models/user';

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
// import index from './models/index'
// User.sync({alter: true})
// Category.sync({alter:true})


app.use('/api/v1/user', UserRouter);
app.use('/api/v1/admin', AdminRouter);


sequelize.sync().then(() => {
  console.log('Database connected');
}).catch((error: Error) => {  // Explicitly type `error` as `Error`
  console.error('Failed to sync database:', error);
});


// Error handler


// Start the server directly in `app.ts`
const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


export default app;
