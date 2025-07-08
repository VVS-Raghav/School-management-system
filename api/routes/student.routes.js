import express from 'express';
import authMiddleware from '../auth/auth.js';
import {registerStudent,loginStudent,getAllStudents,getStudentOwnData,updateStudent,deleteStudent} from '../controllers/student.controller.js';

const router = express.Router();

router.post('/register', authMiddleware(['SCHOOL']), registerStudent);
router.get('/all', authMiddleware(['SCHOOL']), getAllStudents);
router.delete('/delete/:id', authMiddleware(['SCHOOL']), deleteStudent);

router.post('/login', loginStudent);
router.get('/fetch-single', authMiddleware(['STUDENT']), getStudentOwnData);
router.patch('/update', authMiddleware(['STUDENT']), updateStudent);

export default router;
