import jwt from 'jsonwebtoken';
import APIError from '../errors/APIErrors.js';

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer '))
    throw APIError.notFound('Invalid Token');

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const user = jwt.verify(token, process.env.JWT_SECRET);
    // Assign user
    req.user = user;
    next();
  } catch (err) {
    throw APIError.unauthorized('User not verified');
  }
};

export default authenticate;
