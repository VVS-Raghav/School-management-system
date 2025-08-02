import express from 'express';
import { getAllFees, assignFeeToClass, getMyFees, createCheckoutSession } from '../controllers/fees.controller.js';
import authMiddleware from '../auth/auth.js';

const router = express.Router();

router.get('/', authMiddleware(['SCHOOL']), getAllFees);
router.post('/assign', authMiddleware(['SCHOOL']), assignFeeToClass);

router.get('/my-fees', authMiddleware(['STUDENT']), getMyFees);
router.post('/create-checkout-session', authMiddleware(['STUDENT']), createCheckoutSession);

export default router;