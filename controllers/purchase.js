import APIError from '../errors/APIErrors.js';
import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import User from '../models/User.js';
import { verifyAccess } from './product.js';

// Get all product's purchases
export const getProductPurchases = async (req, res) => {
  const { productId } = req.params;

  // Current user
  const currUser = await User.findById(req.user.id).select('role');

  // Product info
  const product = await Product.findById(productId).populate({
    path: 'owner',
    select: 'role',
  });

  // Only allow owner and admin to access this route
  verifyAccess(currUser.role, product.owner._id, req.user.id);

  // Purchases
  const purchases = await Purchase.find({ product: productId });

  res.json({ purchases });
};

export const gatherDataToPredict = async (req, res) => {
  const { productId } = req.params;

  // Current user
  const currUser = await User.findById(req.user.id).select('role');

  // Product info
  const product = await Product.findById(productId).populate({
    path: 'owner',
    select: 'role',
  });

  // Only allow owner and admin to access this route
  verifyAccess(currUser.role, product.owner._id, req.user.id);

  // ##### GATHERING PURCHASES DATA TO BE PREDICTED

  // Start of gathering data date
  const prevDate = new Date();
  const startDate = new Date(prevDate.setDate(prevDate.getDate() - 30));
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const startDay = startDate.getDate();
  const predictionStartDate = `${startYear}-${startMonth}-${startDay}`;

  const today = new Date();

  // All purchases within 30 days
  const purchases = await Purchase.find({
    product: productId,
    createdAt: { $gte: predictionStartDate, $lte: today },
  }).sort({
    createdAt: 1,
  });

  // Weeks purchases container
  const week1 = [],
    week2 = [],
    week3 = [],
    week4 = [];

  // Date of weeks
  const newStartDate = new Date(predictionStartDate);
  const week1Date = new Date(
    newStartDate.setDate(newStartDate.getDate() + 1 * 7)
  );
  const week2Date = new Date(
    newStartDate.setDate(newStartDate.getDate() + 1 * 7)
  );
  const week3Date = new Date(
    newStartDate.setDate(newStartDate.getDate() + 1 * 7)
  );

  // Assigning each purchase into their corresponding week
  purchases.forEach((purchase) => {
    const day = new Date(purchase.createdAt);

    if (day <= week1Date) week1.push(purchase);
    if (day >= week1Date && day <= week2Date) week2.push(purchase);
    if (day >= week2Date && day <= week3Date) week3.push(purchase);
    if (day >= week3Date && day <= today) week4.push(purchase);
  });

  // Data template
  const sales = {
    week1: {
      sold: 0,
    },
    week2: {
      sold: 0,
    },
    week3: {
      sold: 0,
    },
    week4: {
      sold: 0,
    },
  };

  // tallying total quantity sold per week
  week1.forEach((purchase) => (sales.week1.sold += purchase.quantity));
  week2.forEach((purchase) => (sales.week2.sold += purchase.quantity));
  week3.forEach((purchase) => (sales.week3.sold += purchase.quantity));
  week4.forEach((purchase) => (sales.week4.sold += purchase.quantity));

  // stock - stock of the first sale of the week
  sales.week1.stock = week1[0].stock;
  sales.week2.stock = week2[0].stock;
  sales.week3.stock = week3[0].stock;
  sales.week4.stock = week4[0].stock;

  // price - mean value of all the prices
  let week1Price = week1.map((purchase) => purchase.price);
  week1Price = [...new Set(week1Price)];
  let week2Price = week2.map((purchase) => purchase.price);
  week2Price = [...new Set(week2Price)];
  let week3Price = week3.map((purchase) => purchase.price);
  week3Price = [...new Set(week3Price)];
  let week4Price = week4.map((purchase) => purchase.price);
  week4Price = [...new Set(week4Price)];

  // Get median value of all the prices
  const getWeekPrice = (arr) => {
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  };

  // assigning price for every week
  sales.week1.price = getWeekPrice(week1Price);
  sales.week2.price = getWeekPrice(week2Price);
  sales.week3.price = getWeekPrice(week3Price);
  sales.week4.price = getWeekPrice(week4Price);

  const dataToPredict = {
    name: product.name,
    sales,
  };

  res.json(dataToPredict);
};

// Get product purchase
export const getPurchase = async (req, res) => {
  res.json({ message: 'product purchases' });
};

// Delete product purchase
export const deletePurchase = async (req, res) => {
  res.json({ message: 'product purchases' });
};

// Edit product purchase
export const editPurchase = async (req, res) => {
  res.json({ message: 'product purchases' });
};
