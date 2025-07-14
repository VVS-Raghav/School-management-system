import express from 'express';
import authMiddleware from '../auth/auth.js';
import { getAllSchools, loginSchool, getSchoolOwnData, updateSchool, registerSchool, sendOtp, validateOTP} from '../controllers/school.controller.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', validateOTP);
router.post('/register', registerSchool);
router.post('/login', loginSchool);
router.get('/all', getAllSchools);
router.get('/fetch-single',authMiddleware(['SCHOOL']), getSchoolOwnData);
router.patch('/update', authMiddleware(['SCHOOL']), updateSchool);

export default router;