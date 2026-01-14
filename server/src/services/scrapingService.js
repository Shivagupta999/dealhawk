const axios = require('axios');

class ScrapingService {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://serpapi.com',
      timeout: 15000, 
    });
  }

  parsePrice(value) {
    if (!value) return null;

    if (typeof value === 'number') return value;

    const cleaned = value
      .toString()
      .replace(/[^0-9.]/g, '');

    const price = parseFloat(cleaned);
    return isNaN(price) ? null : price;
  }

  normalizeWebsite(source) {
    if (!source) return 'unknown';
    return source.toLowerCase().replace(/\s+/g, '');
  }
  async searchAllWebsites(productName) {
    try {
      const response = await this.client.get('/search', {
        params: {
          engine: 'google_shopping',
          q: productName,
          api_key: process.env.SERPAPI_KEY,
          gl: 'in',
          hl: 'en',
        },
      });

      const items = response.data?.shopping_results || [];

      if (!items.length) {
        return { results: [], lowestPrice: null };
      }

      const results = items
        .map((item) => {
          const price = this.parsePrice(
            item.extracted_price || item.price
          );

          if (!price) return null;

          return {
            website: this.normalizeWebsite(item.source),
            title: item.title,
            price,
            url:
              item.product_link ||
              item.link ||
              item.url ||
              null,
            imageUrl: item.thumbnail || null,
            availability: item.available !== false,
            rating: item.rating || null,
            reviews: item.reviews || null,
          };
        })
        .filter(Boolean);

      if (!results.length) {
        return { results: [], lowestPrice: null };
      }

      const lowest = results.reduce((a, b) =>
        a.price < b.price ? a : b
      );

      return {
        results,
        lowestPrice: {
          price: lowest.price,
          website: lowest.website,
          url: lowest.url,
        },
      };
    } catch (error) {
      console.error(
        '❌ ScrapingService error:',
        error.response?.status,
        error.message
      );
      return { results: [], lowestPrice: null };
    }
  }
}

module.exports = new ScrapingService();
