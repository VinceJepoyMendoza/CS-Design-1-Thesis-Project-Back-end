import express from 'express';
import { createUserSales, getUserSales } from '../controllers/prediction.js';

const router = express.Router();

router.get('/:userId', getUserSales);
router.post('/create', createUserSales);

export default router;
