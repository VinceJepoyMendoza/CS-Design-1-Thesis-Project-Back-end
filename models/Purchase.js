import mongoose from 'mongoose';

const PurchaseSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Product',
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    stock: Number,
    quantity: Number,
    price: Number,
  },
  { timestamps: true }
);

export default new mongoose.model('purchase', PurchaseSchema);
