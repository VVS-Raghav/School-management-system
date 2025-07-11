import express from 'express';
import {createNotice,getAllNotices,deleteNotice,updateNotice} from '../controllers/notice.controller.js';
import authMiddleware from '../auth/auth.js';

const router = express.Router();

router.post('/create', authMiddleware(['SCHOOL']), createNotice);
router.get('/all', authMiddleware(['SCHOOL','TEACHER','STUDENT']), getAllNotices);
router.delete('/delete/:noticeId', authMiddleware(['SCHOOL']), deleteNotice);
router.patch('/update/:noticeId', authMiddleware(['SCHOOL']), updateNotice);

export default router;
