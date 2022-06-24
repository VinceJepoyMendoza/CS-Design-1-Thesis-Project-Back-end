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

  if (!product)
    throw APIError.notFound(`product with id of ${productId} not found`);

  // Only allow owner and admin to access this route
  verifyAccess(currUser.role, product.owner._id, req.user.id);

  // Purchases
  const purchases = await Purchase.find({ product: productId });

  res.json(purchases);
};

// Gather data to use in prediction
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
  let sales = {
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

  // Get median value of all the prices
  const getWeekPrice = (arr) => {
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  };

  // Week1
  if (week1.length) {
    // Quantity
    week1.forEach((purchase) => (sales.week1.sold += purchase.quantity));
    // Price
    let week1Price = week1.map((purchase) => purchase.price);
    week1Price = [...new Set(week1Price)];
    sales.week1.price = getWeekPrice(week1Price);
    // Stock
    sales.week1.stock = week1[0].stock;
  }

  // Week2
  if (week2.length) {
    // Quantity
    week2.forEach((purchase) => (sales.week2.sold += purchase.quantity));
    // Price
    let week2Price = week2.map((purchase) => purchase.price);
    week2Price = [...new Set(week2Price)];
    sales.week2.price = getWeekPrice(week2Price);
    // Stock
    sales.week2.stock = week2[0].stock;
  }

  // Week3
  if (week3.length) {
    // Quantity
    week3.forEach((purchase) => (sales.week3.sold += purchase.quantity));
    // Price
    let week3Price = week3.map((purchase) => purchase.price);
    week3Price = [...new Set(week3Price)];
    sales.week3.price = getWeekPrice(week3Price);
    // Stock
    sales.week3.stock = week3[0].stock;
  }

  // Week4
  if (week4.length) {
    // Quantity
    week4.forEach((purchase) => (sales.week4.sold += purchase.quantity));
    // Price
    let week4Price = week4.map((purchase) => purchase.price);
    week4Price = [...new Set(week4Price)];
    sales.week4.price = getWeekPrice(week4Price);
    // Stock
    sales.week4.stock = week4[0].stock;
  }

  // No sale for the week
  for (const sale of Object.keys(sales)) {
    // No week purchase
    if (!sales[sale].sold) {
      sales[sale].stock = 0;
      sales[sale].price = 0;
    }
  }

  const dataToPredict = {
    name: product.name,
    sales,
  };

  res.json(dataToPredict);
};

// Get owner all purchases
export const getOwnerPurchases = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) throw APIError.notFound(`User with id of ${userId} not found`);

  const currUser = await User.findById(req.user.id);

  if (!user) throw APIError.notFound(`No user with id ${userId}`);

  // Only allow owner and admin to access this route
  verifyAccess(currUser.role, userId, req.user.id);

  const purchases = await Purchase.find({ owner: userId }).sort({
    createdAt: -1,
  });

  res.json(purchases);
};

// Get product purchase
export const getPurchase = async (req, res) => {
  const { purchaseId } = req.params;

  // Current user
  const currUser = await User.findById(req.user.id).select('role');

  // Product info
  const purchase = await Purchase.findById(purchaseId);

  if (!purchase)
    throw APIError.notFound(`Purchase with id of ${purchaseId} not found`);

  // Only allow owner and admin to access this route
  verifyAccess(currUser.role, purchase.owner, req.user.id);

  res.json({ purchase });
};

// Delete product purchase
export const deletePurchase = async (req, res) => {
  const { purchaseId } = req.params;

  // Current user
  const currUser = await User.findById(req.user.id).select('role');

  // Product info
  const purchase = await Purchase.findById(purchaseId);

  if (!purchase)
    throw APIError.notFound(`Purchase with id of ${purchaseId} not found`);

  // Only allow owner and admin to access this route
  verifyAccess(currUser.role, purchase.owner, req.user.id);

  await Purchase.deleteOne({ _id: purchaseId });

  res.json({ message: 'Purchase deleted' });
};

// Edit product purchase
export const editPurchase = async (req, res) => {
  const { purchaseId } = req.params;

  // Current user
  const currUser = await User.findById(req.user.id).select('role');

  // Product info
  const purchase = await Purchase.findById(purchaseId);

  if (!purchase)
    throw APIError.notFound(`Purchase with id of ${purchaseId} not found`);

  // Only allow owner and admin to access this route
  verifyAccess(currUser.role, purchase.owner, req.user.id);

  await Purchase.findByIdAndUpdate(purchaseId, req.body, {
    runValidators: true,
  });

  res.json({ message: 'Purchase updated' });
};

// Create whole month of sales to predict
export const createDataToPredict = async (req, res) => {
  const { productId } = req.params;

  // Current user
  const currUser = await User.findById(req.user.id).select('role');

  // Product info
  const product = await Product.findById(productId);

  if (!product)
    throw APIError.notFound(`Purchase with id of ${productId} not found`);

  // Only allow owner and admin to access this route
  verifyAccess(currUser.role, product.owner, req.user.id);

  const sales = req.body.sales;

  if (!sales.week1 || !sales.week2 || !sales.week3 || !sales.week4)
    throw APIError.badRequest('Please specify all 4 weeks sales');

  const getWeekData = (obj) => {
    return {
      sold: obj.sold,
      stock: obj.stock,
      price: obj.price,
    };
  };

  const dataToPredict = {
    name: product.name,
    sales: {
      week1: getWeekData(sales.week1),
      week2: getWeekData(sales.week2),
      week3: getWeekData(sales.week3),
      week4: getWeekData(sales.week4),
    },
  };

  res.json(dataToPredict);
};
