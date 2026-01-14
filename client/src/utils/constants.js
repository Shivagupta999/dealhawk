// frontend/src/utils/constants.js

export const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const WEBSITES = [
  { name: 'Amazon', value: 'amazon', logo: '🛒' },
  { name: 'Flipkart', value: 'flipkart', logo: '📦' },
  { name: 'eBay', value: 'ebay', logo: '🏷️' },
  { name: 'Meesho', value: 'meesho', logo: '🛍️' },
  { name: 'Shopsy', value: 'shopsy', logo: '🏪' },
  { name: 'Snapdeal', value: 'snapdeal', logo: '🏬' },
  { name: 'Myntra', value: 'myntra', logo: '👔' }
];

export const SORT_OPTIONS = [
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Rating: High to Low', value: 'rating' },
  { label: 'Fastest Delivery', value: 'delivery' },
  { label: 'Best Discount', value: 'discount' }
];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_OTP: '/verify-otp',
  DASHBOARD: '/dashboard',
  PRODUCT_DETAILS: '/product/:id',
  WISHLIST: '/wishlist',
  ALERTS: '/alerts',
  PROFILE: '/profile'
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  UNAUTHORIZED: 'Please login to continue.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.'
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful! Please verify your email.',
  OTP_SENT: 'OTP sent to your email.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  ALERT_CREATED: 'Price alert created successfully.',
  WISHLIST_ADDED: 'Added to wishlist!'
};