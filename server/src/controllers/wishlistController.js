const WishlistItem = require('../models/Wishlist');
const scrapingService = require('../services/scrapingService');

const normalize = (v = '') =>
  v.toLowerCase()
    .replace(/\.com|\.in|\.co\.in/g, '')
    .replace(/[^a-z0-9]/g, '');

exports.addToWishlist = async (req, res, next) => {
  try {
    const { productName, website, currentPrice, url, imageUrl, notes } = req.body;

    if (!productName || !website || currentPrice == null || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await WishlistItem.findOne({
      user: req.user._id,
      productName,
      website
    });

    if (existing) {
      return res.status(400).json({
        error: 'Product already in wishlist',
        item: existing
      });
    }

    const wishlistItem = new WishlistItem({
      user: req.user._id,
      productName,
      website,
      currentPrice,
      url,
      imageUrl,
      notes: notes || '',
      priceHistory: [{ price: currentPrice, date: new Date() }],
      lowestPrice: currentPrice,
      highestPrice: currentPrice
    });

    await wishlistItem.save();

    res.status(201).json({
      message: 'Added to wishlist successfully',
      item: wishlistItem
    });
  } catch (error) {
    next(error);
  }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const { sortBy = 'createdAt', order = 'desc' } = req.query;

    const wishlist = await WishlistItem.find({
      user: req.user._id
    }).sort({ [sortBy]: order === 'desc' ? -1 : 1 });

    res.json({
      wishlist,
      count: wishlist.length
    });
  } catch (error) {
    next(error);
  }
};

exports.getWishlistItem = async (req, res, next) => {
  try {
    const item = await WishlistItem.findOne({
      _id: req.params.itemId,
      user: req.user._id
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }

    res.json({ item });
  } catch (error) {
    next(error);
  }
};

exports.updateWishlistItem = async (req, res, next) => {
  try {
    const { notes, url } = req.body;

    const item = await WishlistItem.findOne({
      _id: req.params.itemId,
      user: req.user._id
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }

    if (notes !== undefined) item.notes = notes;
    if (url !== undefined) item.url = url;

    await item.save();

    res.json({
      message: 'Wishlist item updated successfully',
      item
    });
  } catch (error) {
    next(error);
  }
};

exports.updateWishlistPrice = async (req, res, next) => {
  try {
    const { currentPrice } = req.body;

    if (currentPrice == null || currentPrice <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    const item = await WishlistItem.findOne({
      _id: req.params.itemId,
      user: req.user._id
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }

    item.currentPrice = currentPrice;
    item.lowestPrice = Math.min(item.lowestPrice, currentPrice);
    item.highestPrice = Math.max(item.highestPrice, currentPrice);

    item.priceHistory.push({ price: currentPrice, date: new Date() });

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    item.priceHistory = item.priceHistory.filter(h => h.date >= cutoff);

    await item.save();

    res.json({
      message: 'Price updated successfully',
      item
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const item = await WishlistItem.findOneAndDelete({
      _id: req.params.itemId,
      user: req.user._id
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }

    res.json({
      message: 'Removed from wishlist successfully',
      item
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshWishlistPrices = async (req, res, next) => {
  try {
    if (!req.user && process.env.NODE_ENV === 'production') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = req.user ? { user: req.user._id } : {};
    const wishlistItems = await WishlistItem.find(query);

    const updated = [];
    const errors = [];

    await Promise.all(
      wishlistItems.map(async (item) => {
        try {
          const searchResults = await scrapingService.searchAllWebsites(item.productName);
          if (!searchResults.results?.length) return;

          const sameWebsite = searchResults.results.find(
            r => normalize(r.website) === normalize(item.website)
          );

          const newPrice = sameWebsite
            ? sameWebsite.price
            : searchResults.results[0].price;

          if (newPrice !== item.currentPrice) {
            const oldPrice = item.currentPrice;

            item.currentPrice = newPrice;
            item.lowestPrice = Math.min(item.lowestPrice, newPrice);
            item.highestPrice = Math.max(item.highestPrice, newPrice);

            item.priceHistory.push({ price: newPrice, date: new Date() });

            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 90);
            item.priceHistory = item.priceHistory.filter(h => h.date >= cutoff);

            await item.save();

            updated.push({
              productName: item.productName,
              oldPrice,
              newPrice
            });
          }
        } catch (err) {
          errors.push({ productName: item.productName, error: err.message });
        }
      })
    );

    res.json({
      message: 'Wishlist prices refreshed',
      total: wishlistItems.length,
      updated: updated.length,
      errors: errors.length,
      details: { updated, errors }
    });
  } catch (error) {
    next(error);
  }
};

exports.getPriceDrops = async (req, res, next) => {
  try {
    const wishlist = await WishlistItem.find({ user: req.user._id });

    const priceDrops = wishlist
      .filter(i => i.priceHistory.length > 1 && i.currentPrice < i.priceHistory[0].price)
      .map(item => {
        const initialPrice = item.priceHistory[0].price;
        const drop = initialPrice - item.currentPrice;
        return {
          ...item.toObject(),
          initialPrice,
          priceDrop: drop,
          dropPercentage: Number(((drop / initialPrice) * 100).toFixed(1))
        };
      })
      .sort((a, b) => b.dropPercentage - a.dropPercentage);

    res.json({
      priceDrops,
      count: priceDrops.length
    });
  } catch (error) {
    next(error);
  }
};

exports.clearWishlist = async (req, res, next) => {
  try {
    const result = await WishlistItem.deleteMany({ user: req.user._id });

    res.json({
      message: 'Wishlist cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    next(error);
  }
};
