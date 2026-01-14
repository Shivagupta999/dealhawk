import api from './api';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

const authStorage = {
  set(token, user) {
    if (!token || !user) {
      console.error('❌ Cannot store invalid auth data');
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }
};

const authService = {
  async register(userData) {
    return api.post('/auth/register', userData);
  },

  async verifyOTP(email, otp) {
    const data = await api.post('/auth/verify-otp', { email, otp });

    if (!data?.token || !data?.user) {
      throw new Error('OTP verification failed');
    }

    authStorage.set(data.token, data.user);
    return data;
  },

  async resendOTP(email) {
    return api.post('/auth/resend-otp', { email });
  },

  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });

    if (!data?.token || !data?.user) {
      throw new Error('Login failed');
    }

    authStorage.set(data.token, data.user);
    console.log('✅ Login successful ');

    return data;
  },

  async getMe() {
    return api.get('/users/me');
  },

  async refreshUser() {
    const user = await api.get('/users/me');
    authStorage.setUser(user);
    return user;
  },

  getToken() {
    return authStorage.getToken();
  },

  getUserData() {
    return authStorage.getUser();
  },

  setAuthData(token, user) {
    authStorage.set(token, user);
  },

  setUserData(user) {
    authStorage.setUser(user);
  },

  isAuthenticated() {
    const hasToken = Boolean(authStorage.getToken());
    return hasToken;
  },

  logout() {
    authStorage.clear();
  },

  clearAuthData() {
    authStorage.clear();
  }
};

export default authService;
