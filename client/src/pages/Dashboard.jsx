import React, { useState, useEffect, useRef } from 'react';
import { Heart, Bell, Search as SearchIcon, ShoppingBag, Loader2, TrendingDown, Package, Sparkles, ExternalLink, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProductSearch from '../components/product/ProductSearch';
import PriceComparison from '../components/product/PriceComparison';
import PriceAlertModal from '../components/alerts/PriceAlertModal';
import productService from '../services/productService';
import wishlistService from '../services/wishlistService';
import alertService from '../services/alertService';

const Dashboard = () => {
  const { user, loading: authLoading, isAuthenticated, refreshUser } = useAuth();

  const [searchResults, setSearchResults] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const initialFetchDone = useRef(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchWishlist();
      fetchAlerts();
    }
  }, [authLoading, isAuthenticated, user]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && initialFetchDone.current) {
      if (activeTab === 'wishlist') {
        fetchWishlist();
      }
      if (activeTab === 'alerts') {
        fetchAlerts();
        refreshUser();
      }
    }
  }, [activeTab]);

  const fetchWishlist = async () => {
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Wishlist fetch failed:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const data = await alertService.getAlerts();
      setAlerts(Array.isArray(data) ? data : []);
      await refreshUser();
    } catch (err) {
      console.error('❌ Alerts fetch failed:', err);
    }
  };

  const handleSearch = async ({ productName, websites, sortBy }) => {
    setLoading(true);
    setSearchResults(null);
    try {
      const data = await productService.searchProducts(productName, websites, sortBy);
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    await fetchWishlist();
  };

  const handleRemoveFromWishlist = async (itemId) => {
    if (!window.confirm('Remove this item from wishlist?')) return;
    try {
      await wishlistService.removeFromWishlist(itemId);
      fetchWishlist();
    } catch {
      alert('Failed to remove item');
    }
  };

  const handleCreateAlert = (product) => {
    setSelectedProduct(product);
  };

  const handleAlertSuccess = () => {
    setSelectedProduct(null);
    fetchAlerts();
    alert('✅ Price alert created!');
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      await alertService.deleteAlert(alertId);
      fetchAlerts();
    } catch {
      alert('Failed to delete alert');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-indigo-200 rounded-full animate-pulse"></div>
            <Loader2 className="w-8 h-8 md:w-12 md:h-12 animate-spin text-indigo-600 absolute top-4 left-4" />
          </div>
          <p className="mt-4 text-sm md:text-base text-gray-600 font-medium px-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-20 md:pt-20 pb-8 md:pb-12">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 sm:p-6 md:p-8 mb-5 sm:mb-6 md:mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 -left-4 w-48 h-48 md:w-72 md:h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-48 h-48 md:w-72 md:h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-48 h-48 md:w-72 md:h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2 md:mb-3">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-yellow-300 animate-pulse flex-shrink-0" />
              <h1 className="text-base sm:text-lg md:text-4xl font-bold text-white truncate leading-tight">
                Welcome back, {user?.name}!
              </h1>
            </div>
            <p className="text-indigo-100 text-[11px] sm:text-sm md:text-lg leading-snug">
              Find the best deals and save money
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2 md:gap-4 mt-3 md:mt-6">
              <StatCard
                icon={<Heart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                value={wishlist.length}
                label="Wishlist"
                gradient="from-red-400 to-pink-500"
              />
              <StatCard
                icon={<Bell className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                value={alerts.length}
                label="Alerts"
                gradient="from-green-400 to-emerald-500"
              />
              <StatCard
                icon={<TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />}
                value={user.totalSavings > 0 ? `₹${user.totalSavings}` : 'No savings yet'}
                label="Total Savings"
                gradient="from-yellow-400 to-orange-500"
                className="col-span-2 md:col-span-1"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg mb-4 md:mb-8 overflow-hidden">
          <div className="flex">
            {[
              { key: 'search', icon: SearchIcon, label: 'Search', mobileLabel: 'Search', color: 'indigo' },
              { key: 'wishlist', icon: Heart, label: 'Wishlist', mobileLabel: 'Wishlist', count: wishlist.length, color: 'red' },
              { key: 'alerts', icon: Bell, label: 'Alerts', mobileLabel: 'Alerts', count: alerts.length, color: 'green' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 relative px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 font-semibold transition-all duration-300 ${activeTab === tab.key
                  ? `text-${tab.color}-600 bg-${tab.color}-50`
                  : 'text-gray-600 hover:bg-gray-50 active:bg-gray-100'
                  }`}
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                  <tab.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${activeTab === tab.key ? 'animate-bounce' : ''}`} />
                  <span className="text-xs sm:text-sm md:text-base">{tab.mobileLabel}</span>
                  {tab.count > 0 && (
                    <span className={`px-1.5 sm:px-2 py-0.5 text-xs font-bold rounded-full ${activeTab === tab.key
                      ? `bg-${tab.color}-600 text-white`
                      : 'bg-gray-200 text-gray-600'
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </div>
                {activeTab === tab.key && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-${tab.color}-400 to-${tab.color}-600`}></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'search' && (
          <div className="animate-fadeIn">
            <ProductSearch onSearch={handleSearch} loading={loading} />
            {loading && (
              <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 md:p-12 text-center">
                <div className="relative inline-block">
                  <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
                  <Package className="w-8 h-8 md:w-10 md:h-10 text-indigo-600 absolute top-4 md:top-5 left-4 md:left-5" />
                </div>
                <p className="text-lg md:text-xl font-semibold text-gray-800 mt-6 mb-2">
                  Finding Best Deals...
                </p>
                <p className="text-sm md:text-base text-gray-600">
                  Analyzing prices across platforms
                </p>
              </div>
            )}
            {!loading && searchResults && (
              <PriceComparison
                data={searchResults}
                onAddToWishlist={handleAddToWishlist}
                onCreateAlert={handleCreateAlert}
              />
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="animate-fadeIn">
            {wishlist.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag className="w-16 h-16 md:w-20 md:h-20" />}
                title="Your Wishlist is Empty"
                description="Save products and track prices"
                actionLabel="Start Shopping"
                onAction={() => setActiveTab('search')}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {wishlist.map(item => (
                  <WishlistCard
                    key={item._id}
                    item={item}
                    onRemove={() => handleRemoveFromWishlist(item._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="animate-fadeIn">
            {alerts.length === 0 ? (
              <EmptyState
                icon={<Bell className="w-16 h-16 md:w-20 md:h-20" />}
                title="No Price Alerts Set"
                description="Get notified on price drops"
                actionLabel="Search Products"
                onAction={() => setActiveTab('search')}
              />
            ) : (
              <div className="space-y-3 md:space-y-4">
                {alerts.map(alert => (
                  <AlertCard
                    key={alert._id}
                    alert={alert}
                    onDelete={() => handleDeleteAlert(alert._id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedProduct && (
        <PriceAlertModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSuccess={handleAlertSuccess}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

/* ----------------  COMPONENTS ---------------- */

const StatCard = ({ icon, value, label, gradient, className = '' }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-lg md:rounded-xl p-2 sm:p-2.5 md:p-4  text-white shadow-lg transform hover:scale-105 active:scale-95 transition-transform duration-300 ${className}`}>
    <div className="flex items-center gap-1.5 md:gap-3 mb-0.5 md:mb-2">
      {icon}
      <span className="text-base sm:text-xl md:text-3xl font-bold leading-tight">{value}</span>
    </div>
    <p className="text-[11px] sm:text-xs md:text-sm opacity-90">{label}</p>
  </div>
);

const EmptyState = ({ icon, title, description, actionLabel, onAction }) => (
  <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 md:p-12 text-center">
    <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4 md:mb-6">
      {React.cloneElement(icon, { className: 'text-gray-400' })}
    </div>
    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3 px-4">{title}</h3>
    <p className="text-sm md:text-base text-gray-600 mb-6 max-w-md mx-auto px-4">{description}</p>
    <button
      onClick={onAction}
      className="px-6 md:px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg active:scale-95 transition-all duration-300 text-sm md:text-base"
    >
      {actionLabel}
    </button>
  </div>
);

const WishlistCard = ({ item, onRemove }) => (
  <div className="group bg-white border-2 border-gray-100 rounded-xl p-3 md:p-5 hover:shadow-2xl hover:border-indigo-200 active:scale-98 transition-all duration-300">
    <div className="relative mb-2 md:mb-4">
      {item.imageUrl ? (
        <div className="w-full h-32 sm:h-36 md:h-48 bg-gray-50 rounded-lg overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.productName}
            className="w-full h-full object-contain p-2 md:p-4 group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="w-full h-32 sm:h-36 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          <Package className="w-10 h-10 md:w-16 md:h-16 text-gray-400" />
        </div>
      )}
      <div className="absolute top-2 right-2 bg-white rounded-full p-1.5 md:p-2 shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <Heart className="w-3.5 h-3.5 md:w-5 md:h-5 text-red-500 fill-current" />
      </div>
    </div>

    <div className="mb-2 md:mb-4">
      <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-sm md:text-lg">
        {item.productName}
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-3">{item.website}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          ₹{item.currentPrice}
        </span>
      </div>
    </div>

    <div className="flex gap-2">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 md:py-3 rounded-lg font-semibold hover:shadow-lg active:scale-95 transition-all duration-300 text-sm md:text-base"
      >
        <span>View Deal</span>
        <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </a>
      <button
        onClick={onRemove}
        className="px-3 md:px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:scale-95 transition-all duration-300"
      >
        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>
  </div>
);

const AlertCard = ({ alert, onDelete }) => {
  const savings = alert.currentPrice - alert.targetPrice;
  const savingsPercent = Math.round((savings / alert.currentPrice) * 100);

  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl p-4 md:p-5 hover:shadow-xl hover:border-green-200 active:scale-98 transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
        <div className="flex items-start gap-3 md:gap-4 flex-1 w-full">
          {alert.imageUrl ? (
            <img
              src={alert.imageUrl}
              alt={alert.productName}
              className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-lg bg-gray-50 p-2 flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 mb-1 line-clamp-2 text-sm md:text-lg">
              {alert.productName}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {alert.website}
            </span>

            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 md:mt-3">
              <div>
                <p className="text-xs text-gray-500">Current</p>
                <p className="text-base md:text-lg font-bold text-gray-800">₹{alert.currentPrice}</p>
              </div>
              <div className="text-gray-400">→</div>
              <div>
                <p className="text-xs text-gray-500">Target</p>
                <p className="text-base md:text-lg font-bold text-green-600">₹{alert.targetPrice}</p>
              </div>
              {savingsPercent > 0 && (
                <div className="bg-green-100 text-green-700 px-2 md:px-3 py-1 rounded-full">
                  <p className="text-xs font-bold">Save {savingsPercent}%</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 active:scale-95 transition-all duration-300 font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;