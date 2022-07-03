import mongoose from 'mongoose';

const PredictionSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    predictAttr: {
      type: String,
      enum: ['sales', 'price'],
      default: 'sales',
      required: [true, 'Attribute of prediction cannot be empty'],
    },
    sales: {
      type: [Object],
      required: [true, 'Please provide previous sales to use for prediction'],
    },
    config: Object,
  },
  { timestamps: true }
);

export default new mongoose.model('Prediction', PredictionSchema);
