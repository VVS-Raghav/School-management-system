import express from 'express';
import authMiddleware from '../auth/auth.js';
import {toggleAttendance,getStudentAttendance,isAttendanceTaken} from '../controllers/attendance.controller.js';

const router = express.Router();

router.post('/toggle', authMiddleware(['SCHOOL', 'TEACHER']), toggleAttendance);
router.get('/student/:studentId', authMiddleware(['SCHOOL', 'TEACHER']), getStudentAttendance);
router.get('/check/:classId', authMiddleware(['SCHOOL', 'TEACHER']), isAttendanceTaken);

export default router;
