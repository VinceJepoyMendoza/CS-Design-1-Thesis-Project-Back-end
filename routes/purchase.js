import express from 'express';
import {
  deletePurchase,
  editPurchase,
  gatherDataToPredict,
  getOwnerPurchases,
  getProductPurchases,
  getPurchase,
} from '../controllers/purchase.js';

const router = express.Router();

router.get('/product/:productId', getProductPurchases);
router.get('/user/:userId', getOwnerPurchases);
router.get('/product/gather-data/:productId', gatherDataToPredict);
router
  .route('/single/:purchaseId')
  .get(getPurchase)
  .patch(editPurchase)
  .delete(deletePurchase);

export default router;
