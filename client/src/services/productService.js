import api from './api';

class ProductService {

  async searchProducts(productName, websites = null) {
  
    const data = await api.post('/products/search', { 
      productName, 
      websites 
    });
    console.log('✅ Search response:', data);
    return data; 
  }

  async getPopularProducts() {
    const data = await api.get('/products/popular');
    return data;
  }
  async getPriceHistory(productId, website = null, days = 30) {
    const params = { days };
    if (website) params.website = website;
    
    const data = await api.get(`/products/${productId}/history`, { params });
    return data; 
  }

  async addPriceAlert(productName, targetPrice, website = null) {
    const data = await api.post('/products/alerts', {
      productName,
      targetPrice,
      website
    });
    return data; 
  }

  async getPriceAlerts() {
    try {
      const data = await api.get('/products/alerts');
      return data.alerts || []; 
    } catch (error) {
      console.error('Alerts endpoint not available:', error);
      return [];
    }
  }

  async deletePriceAlert(alertId) {
    const data = await api.delete(`/products/alerts/${alertId}`);
    return data; 
  }

  async addToWishlist(productData) {
    const data = await api.post('/products/wishlist', productData);
    return data; 
  }

  async getWishlist() {
    try {
      const data = await api.get('/products/wishlist');
      return data.wishlist || [];
    } catch (error) {
      console.error('Wishlist endpoint not available:', error);
      return [];
    }
  }

  async removeFromWishlist(itemId) {
    const data = await api.delete(`/products/wishlist/${itemId}`);
    return data;
  }
}

export default new ProductService();