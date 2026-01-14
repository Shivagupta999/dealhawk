const express = require('express');
const {
  addToWishlist,
  getWishlist,
  getWishlistItem,
  updateWishlistItem,
  updateWishlistPrice,
  removeFromWishlist
} = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

const router = express.Router();

router.use(authenticate);

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.itemId)) {
    return res.status(400).json({ error: 'Invalid wishlist item ID' });
  }
  next();
};

router.post('/', addToWishlist);
router.get('/', getWishlist);
router.put('/:itemId/price', validateObjectId, updateWishlistPrice);

router.put('/:itemId', validateObjectId, updateWishlistItem);
router.get('/:itemId', validateObjectId, getWishlistItem);

router.delete('/:itemId', validateObjectId, removeFromWishlist);

module.exports = router;
