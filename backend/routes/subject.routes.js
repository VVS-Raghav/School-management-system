import express from 'express';
import authMiddleware from '../auth/auth.js';
import {getAllSubjects,deleteSubject,createSubject} from '../controllers/subject.controller.js';

const router = express.Router();

router.post('/create',authMiddleware(['SCHOOL']),createSubject);
router.get('/all', authMiddleware(['SCHOOL','TEACHER']), getAllSubjects);
router.delete('/delete/:id', authMiddleware(['SCHOOL']), deleteSubject);

export default router;