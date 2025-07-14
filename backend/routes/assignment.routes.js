import express from 'express';
import { uploadAssignment, getStudentAssignments } from '../controllers/assignment.controller.js';
import authMiddleware from '../auth/auth.js';

const router = express.Router();

router.post('/upload', authMiddleware(['TEACHER']), uploadAssignment);
router.get('/student', authMiddleware(['STUDENT']), getStudentAssignments);

export default router;