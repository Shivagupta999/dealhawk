const scrapingService = require('../services/scrapingService');
const Product = require('../models/Product');
const PriceHistory = require('../models/PriceHistory');
const { getCache, setCache } = require('../utils/cache');

const normalize = (v = '') =>
  v.toLowerCase().replace(/\.com|\.in|\.co\.in/g, '').replace(/[^a-z0-9]/g, '');

exports.searchProduct = async (req, res, next) => {
  try {
    const { productName, websites } = req.body;

    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    /* -------------------- CACHE KEY -------------------- */
    const normalizedProduct = normalize(productName);
    const normalizedWebsites = Array.isArray(websites)
      ? websites.map(normalize).sort().join('-')
      : 'null';

    const cacheKey = `product:search:${normalizedProduct}:${normalizedWebsites}`;

    /* -------------------- CACHE HIT -------------------- */
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({
        ...cached,
        cached: true
      });
    }

    /* -------------------- SCRAPE -------------------- */
    const searchResults = await scrapingService.searchAllWebsites(productName);
    const allResults = searchResults.results || [];

    let filteredResults = allResults;

    if (Array.isArray(websites) && websites.length > 0) {
      const filters = websites.map(normalize);
      filteredResults = allResults.filter(p =>
        filters.some(f =>
          normalize(p.website).includes(f) || f.includes(normalize(p.website))
        )
      );
    }

    filteredResults.sort((a, b) => a.price - b.price);

    const lowest =
      filteredResults.length > 0
        ? filteredResults[0]
        : { price: null, website: null };

    /* -------------------- SAVE PRODUCT -------------------- */
    let product = await Product.findOne({ name: productName });

    if (!product) {
      product = new Product({
        name: productName,
        prices: allResults,
        lowestPrice: searchResults.lowestPrice,
        searches: 1
      });
    } else {
      product.prices = allResults;
      product.lowestPrice = searchResults.lowestPrice;
      product.searches += 1;
    }

    await product.save();

    /* -------------------- PRICE HISTORY -------------------- */
    for (const item of allResults) {
      const last = await PriceHistory.findOne({
        productId: product._id,
        website: item.website
      }).sort({ recordedAt: -1 });

      if (!last || last.price !== item.price) {
        await PriceHistory.create({
          productId: product._id,
          productName,
          website: item.website,
          price: item.price
        });
      }
    }

    /* -------------------- ANALYTICS -------------------- */
    const prices = filteredResults.map(p => p.price);
    const max = prices.length ? Math.max(...prices) : 0;

    const response = {
      prices: filteredResults,
      analytics: {
        lowestPrice: lowest.price,
        website: lowest.website,
        numberOfSites: filteredResults.length,
        averagePrice: prices.length
          ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
          : 0,
        savingsPercent:
          prices.length > 1 && max
            ? Math.round(((max - lowest.price) / max) * 100)
            : 0
      }
    };

    /* -------------------- CACHE SET -------------------- */
    await setCache(cacheKey, response);

    res.json(response);

  } catch (error) {
    next(error);
  }
};

exports.getPopularProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .sort({ searches: -1 })
      .limit(6)
      .select('name lowestPrice searches');

    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getProductHistory = async (req, res, next) => {
  try {
    const history = await PriceHistory.find({
      productId: req.params.productId
    })
      .sort({ recordedAt: 1 })
      .select('price website recordedAt');

    res.json(history);
  } catch (error) {
    next(error);
  }
};

exports.addToFavorites = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!req.user.favorites.includes(productId)) {
      req.user.favorites.push(productId);
      await req.user.save();
    }

    res.json({ message: 'Added to favorites' });
  } catch (error) {
    next(error);
  }
};
