import api from './api';

class WishlistService {
  async addToWishlist(productData) {
    const data = await api.post('/wishlist', productData);
    return data;
  }
  async getWishlist() {
    const data = await api.get('/wishlist');
    return data.wishlist || [];
  }
  async getWishlistItem(itemId) {
    const data = await api.get(`/wishlist/${itemId}`);
    return data.item;
  }
  async removeFromWishlist(itemId) {
    const data = await api.delete(`/wishlist/${itemId}`);
    return data;
  }
  async updatePrice(itemId, currentPrice) {
    const data = await api.put(`/wishlist/${itemId}/price`, { currentPrice });
    return data;
  }
}

export default new WishlistService();