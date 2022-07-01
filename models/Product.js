import mongoose from 'mongoose';

const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name cannot be empty'],
    trim: true,
  },
  owner: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  },
  price: {
    type: Number,
    required: [true, "Please enter product's price"],
    min: 0,
  },
  stock: {
    type: Number,
    required: [true, 'Please enter stock'],
    min: 0,
  },
  category: {
    type: String,
    trim: true,
  },
  size: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    trim: true,
  },
  flavor: {
    type: String,
    trim: true,
  },
});

export default new mongoose.model('Product', ProductSchema);
