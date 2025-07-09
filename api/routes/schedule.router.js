import express from 'express';
import authMiddleware from '../auth/auth.js';
import {createSchedule,getAllSchedules,getSchedule,deleteSchedule,updateSchedule} from '../controllers/schedule.controller.js';

const router = express.Router();

router.post('/create', authMiddleware(['SCHOOL']), createSchedule);
router.get('/fetch-single/:id', authMiddleware(['SCHOOL']), getSchedule);
router.get('/all/:id', authMiddleware(['SCHOOL']), getAllSchedules);
router.patch('/update/:id', authMiddleware(['SCHOOL']), updateSchedule);
router.delete('/delete/:id', authMiddleware(['SCHOOL']), deleteSchedule);

export default router;
