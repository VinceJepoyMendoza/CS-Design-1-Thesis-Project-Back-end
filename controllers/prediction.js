import Prediction from '../models/Prediction.js';

// Get user sales
export const getUserSales = async (req, res) => {
  const { userId } = req.params;

  const sale = await Prediction.findById(userId);

  res.json(sale);
};

// Create sales for user
export const createUserSales = async (req, res) => {
  req.body.owner = req.user.id;

  await Prediction.create(req.body);

  res.json({ message: 'sales saves' });
};
