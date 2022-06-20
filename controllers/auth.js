import APIError from '../errors/APIErrors.js';
import User from '../models/User.js';

// Create new user
export const registerUser = async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword || password !== confirmPassword)
    throw APIError.unauthorized('Password does not match');

  try {
    // Save user to db
    await User.create(req.body);

    res.status(201).json({ message: 'User Created' });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw APIError.badRequest('Please provide email and password');

  // Check if user exist
  const userExist = await User.exists({ email });

  if (!userExist)
    throw APIError.notFound(`User with email ${email} does not exist`);

  // Retrieving email
  const user = await User.findOne({ email });
  if (!user) throw APIError.badRequest('Email and password does not match');

  // Verifying password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw APIError.badRequest('Email and password does not match');

  // Generate token
  const token = user.createToken();

  res.status(200).json({ token });
};
