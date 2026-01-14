const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  priceHistory: [{
    price: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  lowestPrice: {
    type: Number,
    default: null
  },
  highestPrice: {
    type: Number,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient querying
wishlistItemSchema.index({ user: 1 });

// Update lowest/highest prices before saving
wishlistItemSchema.pre('save', function(next) {
  if (this.priceHistory && this.priceHistory.length > 0) {
    const prices = this.priceHistory.map(h => h.price);
    this.lowestPrice = Math.min(...prices);
    this.highestPrice = Math.max(...prices);
  }
  next();
});

const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema);

module.exports = WishlistItem;