import express from 'express';
import authMiddleware from '../auth/auth.js';
import {markAttendance,getStudentAttendance,isAttendanceTaken} from '../controllers/attendance.controller.js';

const router = express.Router();

router.post('/mark-attendance/:classId', authMiddleware(['TEACHER']), markAttendance);
router.get('/student/:studentId', authMiddleware(['SCHOOL', 'TEACHER','STUDENT']), getStudentAttendance);
router.get('/check/:classId', authMiddleware(['SCHOOL', 'TEACHER']), isAttendanceTaken);

export default router;
