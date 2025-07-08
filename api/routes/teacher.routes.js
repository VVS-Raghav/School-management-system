import express from 'express';
import authMiddleware from '../auth/auth.js';
import { registerTeacher, loginTeacher, getAllTeachers, getTeacherOwnData, getTeacherWithId, updateTeacher, deleteTeacher } from '../controllers/teacher.controller.js';

const router = express.Router();

router.post('/register', authMiddleware(['SCHOOL']), registerTeacher);
router.get('/all', authMiddleware(['SCHOOL']), getAllTeachers);
router.get('/fetch/:id', authMiddleware(['SCHOOL']), getTeacherWithId);
router.patch('/update/:id', authMiddleware(['SCHOOL']), updateTeacher);
router.delete('/delete/:id', authMiddleware(['SCHOOL']), deleteTeacher);

router.post('/login', loginTeacher);
router.get('/fetch-single', authMiddleware(['TEACHER']), getTeacherOwnData);

export default router;