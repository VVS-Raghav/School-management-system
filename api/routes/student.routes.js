import express from 'express';
import authMiddleware from '../auth/auth.js';
import {registerStudent,loginStudent,getAllStudents,getStudentOwnData,getStudentWithId,updateStudent,deleteStudent} from '../controllers/student.controller.js';

const router = express.Router();

router.post('/register', authMiddleware(['SCHOOL']), registerStudent);
router.get('/all', authMiddleware(['SCHOOL']), getAllStudents);
router.get('/fetch/:id', authMiddleware(['SCHOOL']), getStudentWithId);
router.patch('/update/:id', authMiddleware(['SCHOOL']), updateStudent);
router.delete('/delete/:id', authMiddleware(['SCHOOL']), deleteStudent);

router.post('/login', loginStudent);
router.get('/fetch-single', authMiddleware(['STUDENT']), getStudentOwnData);

export default router;