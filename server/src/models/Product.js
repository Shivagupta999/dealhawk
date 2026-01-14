const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,  
      index: true        
    },

    description: String,
    category: String,
    imageUrl: String,

    prices: [
      {
        website: String,
        price: Number,
        url: String,
        availability: Boolean,
        lastUpdated: { type: Date, default: Date.now }
      }
    ],

    lowestPrice: {
      price: Number,
      website: String,
      url: String
    },

    searches: {
      type: Number,
      default: 0
    },

    priceHistory: [
      {
        date: { type: Date, default: Date.now },
        prices: [
          {
            website: String,
            price: Number
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
