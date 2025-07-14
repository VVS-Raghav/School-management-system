import express from 'express';
import {uploadResult,getStudentResults} from '../controllers/result.controller.js';
import authMiddleware from '../auth/auth.js';


const router = express.Router();

router.post('/upload',authMiddleware('TEACHER'), uploadResult);
router.get('/student/:examId',authMiddleware('STUDENT'), getStudentResults);
// router.get('/class/:classId', getClassResults);

export default router;