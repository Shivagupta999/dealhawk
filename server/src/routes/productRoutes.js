const express = require('express');
const {
  searchProduct,
  getProductHistory,
  addToFavorites,
  getPopularProducts
} = require('../controllers/productController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/search', optionalAuth, searchProduct);
router.get('/popular', getPopularProducts);

router.get('/:productId/history', getProductHistory);
router.post('/:productId/favorite', authenticate, addToFavorites);

module.exports = router;
