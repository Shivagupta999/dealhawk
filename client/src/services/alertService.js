import api from './api';

const alertService = {
  /**
   * Create a new price alert
   * @param {Object} alertData
   */
  async createAlert(alertData) {
    try {
      const response = await api.post('/alerts', alertData);
      return response?.alert ?? response;
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getAlerts() {
    try {
      const response = await api.get('/alerts');
      return response?.alerts ?? [];
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  /**
   * Delete an alert by ID
   * @param {string} alertId
   */
  async deleteAlert(alertId) {
    try {
      return await api.delete(`/alerts/${alertId}`);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  /**
   * Update an existing alert
   * @param {string} alertId
   * @param {Object} updateData
   */
  async updateAlert(alertId, updateData) {
    try {
      return await api.put(`/alerts/${alertId}`, updateData);
    } catch (error) {
      throw normalizeApiError(error);
    }
  }
};

function normalizeApiError(error) {
  return {
    message:
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong. Please try again.',
    status: error?.response?.status || 500
  };
}

export default alertService;
