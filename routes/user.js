import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getCurrUser,
  getUserById,
  updateUser,
} from '../controllers/user.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/current-user', getCurrUser);
router.route('/:userId').get(getUserById).patch(updateUser).delete(deleteUser);

export default router;
