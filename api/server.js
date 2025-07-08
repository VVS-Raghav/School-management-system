import express from 'express';
import cors from 'cors';
import mongoose, { mongo } from 'mongoose';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import schoolRouter from './routes/school.routes.js';
import classRouter from './routes/class.routes.js';
import subjectRouter from './routes/subject.router.js';
import studentRouter from './routes/student.routes.js';
import teacherRouter from './routes/teacher.routes.js';

const app = express();
const corsOptions = {exposedHeaders: ['Authorization']};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
.then(() => {console.log('Connected to MongoDB');})
.catch((err) => {console.error('Error connecting to MongoDB:', err);});


// Routers
app.use('/api/school', schoolRouter);
app.use('/api/class', classRouter);
app.use('/api/subject', subjectRouter);
app.use('/api/student', studentRouter);
app.use('/api/teacher',teacherRouter);




const PORT = process.env.PORT || 5000;
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});