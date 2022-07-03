import APIError from '../errors/APIErrors.js';
import Product from '../models/Product.js';
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
  const { confirmPassword } = req.body;

  const user = await User.findById(userId);

  const currUser = await User.findById(req.user.id);

  // Only allow owner and admin to access this route
  if (currUser.role !== 'admin' && userId !== req.user.id)
    throw APIError.forbiddden('You do not own this account');

  // No user found
  if (!user) throw APIError.notFound('User not found');

  // Require password for non admins
  if (currUser.role !== 'admin') {
    if (!confirmPassword)
      throw APIError.notFound('Password confirmation not found');
    const isVerified = await user.comparePassword(confirmPassword);
    if (!isVerified)
      throw APIError.forbiddden('Incorrect password confirmation');
  }
  // Require password for admins
  if (currUser.role === 'admin') {
    if (!confirmPassword)
      throw APIError.notFound('Password confirmation not found');
    const isVerified = await currUser.comparePassword(confirmPassword);
    if (!isVerified)
      throw APIError.forbiddden('Incorrect password confirmation');
  }

  // Delete user
  await User.findByIdAndDelete(user);

  // Delete user's products
  await Product.deleteMany({ owner: user._id });

  res.status(200).json({ message: 'User deleted' });
};

// Update user
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { confirmPassword } = req.body;

  if (!Object.keys(req.body).length)
    throw APIError.badRequest('Please provide values to be updated');

  const user = await User.findById(userId);

  const currUser = await User.findById(req.user.id).select('role');

  // Only allow owner and admin to access this route
  if (currUser.role !== 'admin' && userId !== req.user.id)
    throw APIError.forbiddden('You do not own this account');

  // No user found
  if (!user) throw APIError.notFound('User not found');

  if (!confirmPassword)
    throw APIError.badRequest('Please provide password confirmation');

  // Verifying password
  const isVerified = await user.comparePassword(req.body.confirmPassword);
  if (!isVerified) throw APIError.badRequest('Incorrect password confirmation');

  // Update user
  await User.findByIdAndUpdate(userId, req.body, {
    runValidators: true,
  });
  res.status(201).json({ message: 'User updated' });
};

export const updateRole = async (req, res) => {
  const { userId } = req.params;
  const status = req.body.role;

  const currUser = await User.findById(req.user.id);

  if (!status) throw APIError.notFound('Role not found');

  if (currUser.role !== 'admin')
    throw APIError.forbiddden('Only admins can access this route');

  const searchUser = await User.findById(userId);

  if (!searchUser) throw APIError.notFound(`User with id ${userId} not found`);

  await User.findByIdAndUpdate(
    userId,
    { role: status },
    {
      runValidators: true,
    }
  );

  res.json({ message: 'User updated' });
};
