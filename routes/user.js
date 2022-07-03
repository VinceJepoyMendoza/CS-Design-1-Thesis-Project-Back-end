import express from 'express';
import {
  deleteUser,
  getAllUsers,
  getCurrUser,
  getUserById,
  updateRole,
  updateUser,
} from '../controllers/user.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/current-user', getCurrUser);
router.patch('/update-role/:userId', updateRole);
router.route('/:userId').get(getUserById).patch(updateUser).delete(deleteUser);

export default router;
