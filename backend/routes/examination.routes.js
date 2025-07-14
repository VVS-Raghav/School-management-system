import express from 'express';
import authMiddleware from '../auth/auth.js';
import {newExamination,getAllExaminations,getExaminationsByClass,updateExaminationById,deleteExaminationById,getExamById} from '../controllers/examination.controller.js';

const router = express.Router();

router.post('/create', authMiddleware(['SCHOOL']), newExamination);
router.get('/all', authMiddleware(['SCHOOL','TEACHER']), getAllExaminations);
router.get('/class/:classId', authMiddleware(['SCHOOL','STUDENT','TEACHER']), getExaminationsByClass);
router.get('/id/:examId', authMiddleware(['SCHOOL','TEACHER']),getExamById);
router.patch('/update/:examId', authMiddleware(['SCHOOL']), updateExaminationById);
router.delete('/delete/:examId', authMiddleware(['SCHOOL']), deleteExaminationById);

export default router;
