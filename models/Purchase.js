import mongoose from 'mongoose';

const PurchaseSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Product',
    },
    stock: Number,
    quantity: Number,
    price: Number,
  },
  { timestamps: true }
);

export default new mongoose.model('purchase', PurchaseSchema);
