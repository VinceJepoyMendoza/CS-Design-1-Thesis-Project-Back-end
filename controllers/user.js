import APIError from '../errors/APIErrors.js';
import User from '../models/User.js';

// Get all user
export const getAllUsers = async (req, res) => {
  let users = await User.find({});

  const currUser = await User.findById(req.user.id).select('role');
  // Only allow admin account to access this route
  if (currUser.role !== 'admin')
    throw APIError.forbiddden('Only admins can access this route');

  users = users.map((user) => {
    const tempUser = { ...user._doc };
    // Remove password
    delete tempUser.password;

    return tempUser;
  });

  res.status(200).json(users);
};

// Get current user by token
export const getCurrUser = async (req, res) => {
  const user = await User.findById(req.user.id);
  const finalUser = { ...user._doc };
  // Remove password
  delete finalUser.password;

  res.status(200).json({ user: finalUser });
};

// Get single user by id
export const getUserById = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  const currUser = await User.findById(req.user.id).select('role');

  // No user found
  if (!user) throw APIError.notFound('User not found');

  // Only allow owner and admin to access this route
  if (currUser.role !== 'admin' && userId !== req.user.id)
    throw APIError.forbiddden('You do not own this account');

  res.status(200).json({ user });
};

// Delete user
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  const currUser = await User.findById(req.user.id).select('role');

  // Only allow owner and admin to access this route
  if (currUser.role !== 'admin' && userId !== req.user.id)
    throw APIError.forbiddden('You do not own this account');

  // No user found
  if (!user) throw APIError.notFound('User not found');

  // Delete user
  await User.findByIdAndDelete(user);

  res.status(200).json({ message: 'User deleted' });
};

// Update user
export const updateUser = async (req, res) => {
  const { userId } = req.params;

  if (!Object.keys(req.body).length)
    throw APIError.badRequest('Please provide values to be updated');

  const user = await User.findById(userId);

  const currUser = await User.findById(req.user.id).select('role');

  // Only allow owner and admin to access this route
  if (currUser.role !== 'admin' && userId !== req.user.id)
    throw APIError.forbiddden('You do not own this account');

  // No user found
  if (!user) throw APIError.notFound('User not found');

  // Update user
  await User.findByIdAndUpdate(userId, req.body, {
    runValidators: true,
  });
  res.status(201).json({ message: 'User updated' });
};
