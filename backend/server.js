import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import schoolRouter from './routes/school.routes.js';
import classRouter from './routes/class.routes.js';
import subjectRouter from './routes/subject.routes.js';
import studentRouter from './routes/student.routes.js';
import teacherRouter from './routes/teacher.routes.js';
import scheduleRouter from './routes/schedule.routes.js';
import attendanceRouter from './routes/attendance.routes.js';
import examinationRouter from './routes/examination.routes.js';
import assignmentRouter from './routes/assignment.routes.js';
import noticeRouter from './routes/notice.routes.js';
import resultRouter from './routes/result.routes.js';

const app = express();
const corsOptions = {exposedHeaders: ['Authorization']};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/files', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
.then(() => {console.log('Connected to MongoDB');})
.catch((err) => {console.error('Error connecting to MongoDB:', err);});


// Routers
app.use('/api/school', schoolRouter);
app.use('/api/class', classRouter);
app.use('/api/subject', subjectRouter);
app.use('/api/student', studentRouter);
app.use('/api/teacher',teacherRouter);
app.use('/api/schedule',scheduleRouter);
app.use('/api/attendance',attendanceRouter);
app.use('/api/examination',examinationRouter);
app.use('/api/notice',noticeRouter);
app.use('/api/assignment',assignmentRouter);
app.use('/api/result',resultRouter);




const PORT = process.env.PORT || 5000;
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});