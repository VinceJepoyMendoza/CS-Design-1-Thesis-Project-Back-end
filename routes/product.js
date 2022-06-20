import exress from 'express';
import {
  createProduct,
  deleteProduct,
  editProduct,
  getProduct,
  getUserProducts,
  purchaseProduct,
} from '../controllers/product.js';

const router = exress.Router();

router.post('/', createProduct);
router.get('/user/:userId', getUserProducts);
router.patch('/purchase/:productId', purchaseProduct);
router
  .route('/:productId')
  .get(getProduct)
  .patch(editProduct)
  .delete(deleteProduct);

export default router;
