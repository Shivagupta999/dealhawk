const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: Number,
  currency: {
    type: String,
    default: 'INR'
  },
  availability: String,
  inStock: Boolean,
  recordedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

priceHistorySchema.index({ productId: 1, website: 1, recordedAt: -1 });
priceHistorySchema.index({ recordedAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);