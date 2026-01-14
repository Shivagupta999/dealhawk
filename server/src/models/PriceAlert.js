const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    productName: {
      type: String,
      required: true,
      trim: true
    },

    normalizedName: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },

    targetPrice: {
      type: Number,
      required: true,
      min: 0
    },

    initialPrice: {
      type: Number,
      required: true,
      min: 0
    },

    currentPrice: {
      type: Number,
      required: true,
      min: 0
    },

    website: {
      type: String,
      trim: true,
      default: null
    },

    normalizedWebsite: {
      type: String,
      lowercase: true,
      default: null,
      index: true
    },

    url: {
      type: String,
      default: null
    },

    imageUrl: {
      type: String,
      default: null
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    notified: {
      type: Boolean,
      default: false,
      index: true
    },

    lastChecked: {
      type: Date,
      default: null
    },

    triggeredAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

priceAlertSchema.index({
  user: 1,
  normalizedName: 1,
  normalizedWebsite: 1,
  isActive: 1
});

priceAlertSchema.index({
  isActive: 1,
  notified: 1
});

priceAlertSchema.index({
  user: 1,
  createdAt: -1
});

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
