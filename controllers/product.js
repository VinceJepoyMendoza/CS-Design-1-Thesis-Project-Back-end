import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import APIError from '../errors/APIErrors.js';
import User from '../models/User.js';

// Get all products of user
export const getUserProducts = async (req, res) => {
  const { userId } = req.params;

  // Current user
  const currUser = await User.findById(req.user.id);

  // Check if user can access this route
  verifyAccess(currUser.role, userId, req.user.id);

  if (!currUser)
    throw APIError.notFound(`User with id of ${userId} does not exist`);

  // Retrieving products
  const products = await Product.find({ owner: userId });

  res.status(200).json({ length: products.length, products });
};

// Get product's info
export const getProduct = async (req, res) => {
  const { productId } = req.params;

  // Product info
  const product = await Product.findById(productId);

  if (!product)
    throw APIError.notFound(`Product with id ${productId} does not exist`);

  // Current user
  const currUser = await User.findById(req.user.id);

  // Check if user can access this route
  verifyAccess(currUser.role, product.owner, req.user.id);

  res.status(200).json({ product });
};

// Create product
export const createProduct = async (req, res) => {
  // Set product owner to the current user
  req.body.owner = req.user.id;

  // Save product to db
  await Product.create(req.body);

  res.status(201).json({ message: 'Product Created' });
};

// Edit product
export const editProduct = async (req, res) => {
  const { productId } = req.params;

  // Product info
  const product = await Product.findById(productId);

  if (!product)
    throw APIError.notFound(`Product with id ${productId} does not exist`);

  // Current user
  const currUser = await User.findById(req.user.id);

  // Check if user can access this route
  verifyAccess(currUser.role, product.owner, req.user.id);

  await Product.findByIdAndUpdate(productId, req.body, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({ message: 'Product updated' });
};

// Delete product
export const deleteProduct = async (req, res) => {
  const { productId } = req.params;

  // Product info
  const product = await Product.findById(productId);

  if (!product)
    throw APIError.notFound(`Product with id ${productId} does not exist`);

  // Current user
  const currUser = await User.findById(req.user.id);

  // Check if user can access this route
  verifyAccess(currUser.role, product.owner, req.user.id);

  await Product.deleteOne({ _id: productId });

  res.status(200).json({ message: 'Product Deleted' });
};

// Purchase product
export const purchaseProduct = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.query;

  // No quantity
  if (!quantity)
    throw APIError.badRequest('Please specify quantity of product purchased');

  // Product info
  const product = await Product.findById(productId);

  // No product found
  if (!product)
    throw APIError.notFound(`Product with id ${productId} does not exist`);

  // Current user
  const currUser = await User.findById(req.user.id);

  // Check if user can access this route
  verifyAccess(currUser.role, product.owner, req.user.id);

  // Purchase info
  const purchaseInfo = {
    product: productId,
    stock: product.stock,
    quantity,
    price: product.price,
  };

  // Save purchase info to db
  await Purchase.create(purchaseInfo);

  // Update product quantity
  product.stock -= quantity;

  // Save updated product to db
  await product.save();

  res.json({ message: 'Product purchase successful' });
};

// ## utils

// Verify if the current user is the owner or admin
export const verifyAccess = (role, userId, currId) => {
  if (role !== 'admin' && userId.toString() !== currId)
    throw APIError.forbiddden('Only the owner can access this route');
};
