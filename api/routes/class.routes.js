import express from 'express';
import authMiddleware from '../auth/auth.js';
import {getAllClasses,deleteClass,createClass, updateClass, getClassById} from '../controllers/class.controller.js';

const router = express.Router();

router.post('/create',authMiddleware(['SCHOOL']),createClass);
router.get('/all', authMiddleware(['SCHOOL']), getAllClasses);
router.get('/:id', authMiddleware(['SCHOOL']), getClassById);
router.patch('/update/:id', authMiddleware(['SCHOOL']), updateClass);
router.delete('/delete/:id', authMiddleware(['SCHOOL']), deleteClass);

export default router;