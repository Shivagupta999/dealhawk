const express = require('express');

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const priceAlertRoutes = require('./priceAlertRoutes');

const router = express.Router();

/* ---------------- AUTH ---------------- */
router.use('/auth', authRoutes);

/* ---------------- PRODUCTS ---------------- */
router.use('/products', productRoutes);

/* ---------------- WISHLIST ---------------- */
router.use('/wishlist', wishlistRoutes);

/* ---------------- PRICE ALERTS ---------------- */
router.use('/alerts', priceAlertRoutes);

/* ---------------- HEALTH CHECK ---------------- */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'PriceHunt API',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
