import express from 'express';
import authMiddleware from '../auth/auth.js';
import {getAllClasses,deleteClass,createClass} from '../controllers/class.controller.js';

const router = express.Router();

router.post('/create',authMiddleware(['SCHOOL']),createClass);
router.get('/all', authMiddleware(['SCHOOL']), getAllClasses);
router.delete('/delete/:id', authMiddleware(['SCHOOL']), deleteClass);

export default router;