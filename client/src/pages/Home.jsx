import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingCart,
  Zap,
  Shield,
  BarChart3,
  Sparkles,
  Target,
  ArrowRight,
  X
} from 'lucide-react';
import ProductSearch from '../components/product/ProductSearch';
import PriceComparison from '../components/product/PriceComparison';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';

// Toast Component
const Toast = ({ message, type = 'info', onClose, action }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    info: 'from-blue-500 to-indigo-500',
    warning: 'from-orange-500 to-red-500',
    success: 'from-green-500 to-emerald-500'
  };

  return (
    <div className="fixed top-20 right-4 z-50 animate-slideIn">
      <div className={`bg-gradient-to-r ${colors[type]} text-white rounded-xl shadow-2xl p-4 pr-12 max-w-sm`}>
        <p className="font-semibold mb-2">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm underline hover:no-underline font-medium"
          >
            {action.text}
          </button>
        )}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Home = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPopularProducts();
  }, []);

  const fetchPopularProducts = async () => {
    try {
      const data = await productService.getPopularProducts();
      const products = Array.isArray(data) ? data : data?.products || [];
      setPopularProducts(products.slice(0, 6));
    } catch (err) {
      console.error('Failed to fetch popular products:', err);
      setPopularProducts([]);
    }
  };

  const handleSearch = async ({ productName, websites, sortBy }) => {
    setLoading(true);
    setError('');
    setSearchResults(null);

    try {
      const data = await productService.searchProducts(productName, websites, sortBy);
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err?.message || 'Failed to search products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePopularClick = (productName) => {
    handleSearch({ productName });
  };

  const handleCreateAlert = (product) => {
    if (!isAuthenticated) {
      setToast({
        message: 'Please sign up or login to continue creating alerts',
        type: 'warning',
        action: {
          text: 'Login Now',
          onClick: () => {
            setToast(null);
            navigate('/login');
          }
        }
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {

      setToast({
        message: 'Price alert feature coming soon!',
        type: 'info'
      });
    }
  };

  const handleAddToWishlist = async (product) => {
    if (!isAuthenticated) {
      setToast({
        message: 'Please sign up or login to add items to wishlist',
        type: 'warning',
        action: {
          text: 'Login Now',
          onClick: () => {
            setToast(null);
            navigate('/login');
          }
        }
      });
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    setToast({
      message: 'Added to wishlist successfully!',
      type: 'success'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-16 sm:pt-20 md:pt-20 pb-8 md:pb-12">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          action={toast.action}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container mx-auto px-3 sm:px-4">
        {!searchResults && (
          <div className="relative mb-10 md:mb-8 overflow-hidden">
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              <div className="absolute top-0 -left-10 w-72 md:w-96 h-72 md:h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
              <div className="absolute top-0 -right-10 w-72 md:w-96 h-72 md:h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-16 left-20 w-72 md:w-96 h-72 md:h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl">
                    <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    DealHawk
                  </span>
                </h1>
              </div>

              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4 px-4">
                Find the Best Deals Instantly
              </p>

              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 md:mb-6 max-w-2xl mx-auto px-4">
                Compare prices across 6+ platforms in real-time
              </p>
              <div className="hidden md:block max-w-3xl mx-auto px-4 mb-6">
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  DealHawk is your ultimate shopping companion that scours multiple e-commerce platforms 
                  to help you make smart purchasing decisions. Never overpay again with our intelligent 
                  price comparison engine.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-indigo-100">
                    <p className="font-bold text-indigo-600 mb-1">⚡ Real-Time Updates</p>
                    <p className="text-gray-600">Live price monitoring across all major platforms</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-purple-100">
                    <p className="font-bold text-purple-600 mb-1">🎯 Smart Alerts</p>
                    <p className="text-gray-600">Get notified when prices drop on your wishlist</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-pink-100">
                    <p className="font-bold text-pink-600 mb-1">💰 Save More</p>
                    <p className="text-gray-600">Track savings and compare historical prices</p>
                  </div>
                </div>
              </div>

              {/* Feature Pills - Compact */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-3 px-4 mb-6 md:mb-8">
                <FeaturePill icon={<Zap />} text="Real-time" color="yellow" />
                <FeaturePill icon={<Shield />} text="Tracking" color="green" />
                <FeaturePill icon={<BarChart3 />} text="Analytics" color="blue" />
                <FeaturePill icon={<Target />} text="Best Deals" color="red" />
              </div>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto mb-6 md:mb-8">
          <ProductSearch onSearch={handleSearch} loading={loading} />
        </div>

        {error && (
          <div className="max-w-5xl mx-auto mb-6 md:mb-8 rounded-xl md:rounded-2xl border-2 border-red-200 bg-red-50 p-4 md:p-6 text-red-700 flex items-start gap-3 animate-shake">
            <div className="flex-shrink-0 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">!</div>
            <p className="text-sm md:text-base">{error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 md:py-16">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 border-8 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
              <ShoppingCart className="w-10 h-10 md:w-12 md:h-12 text-indigo-600 absolute top-5 left-5 md:top-6 md:left-6" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-800 mb-2 px-4">
              Finding Best Deals...
            </p>
            <p className="text-sm md:text-base text-gray-600 px-4">
              Analyzing prices across multiple platforms
            </p>
          </div>
        )}

        {!loading && searchResults && (
          <div className="max-w-7xl mx-auto animate-fadeIn">
            <PriceComparison 
              data={searchResults} 
              onCreateAlert={handleCreateAlert}
              onAddToWishlist={handleAddToWishlist}
            />
          </div>
        )}
        {!loading && !searchResults && popularProducts.length > 0 && (
          <div className="max-w-6xl mx-auto animate-fadeIn mb-8 md:mb-8">
            <div className="mb-4 md:mb-6 flex items-center gap-2 md:gap-3 px-1">
              <div className="p-1.5 md:p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg md:rounded-xl flex-shrink-0">
                <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800">
                  Trending Searches
                </h2>
                <p className="text-xs md:text-base text-gray-600">See what's popular</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {popularProducts.map((product, index) => (
                <TrendingCard
                  key={product._id || index}
                  product={product}
                  rank={index + 1}
                  onClick={() => handlePopularClick(product.name)}
                />
              ))}
            </div>
          </div>
        )}

        {!searchResults && (
          <div className="max-w-6xl mx-auto mt-8 md:mt-8">
            <div className="text-center mb-6 md:mb-8 px-4">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-4">
                How It Works
              </h2>
              <p className="text-sm md:text-lg text-gray-600">
                Save money in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4">
              <StepCard
                step={1}
                icon={<Sparkles className="w-8 h-8 md:w-12 md:h-12" />}
                title="Search Product"
                description="Enter the product name you want to buy"
                color="from-blue-500 to-cyan-500"
              />
              <StepCard
                step={2}
                icon={<BarChart3 className="w-8 h-8 md:w-12 md:h-12" />}
                title="Compare Prices"
                description="See prices from all major e-commerce sites"
                color="from-purple-500 to-pink-500"
              />
              <StepCard
                step={3}
                icon={<ShoppingCart className="w-8 h-8 md:w-12 md:h-12" />}
                title="Buy Smart"
                description="Get the best deal and save money"
                color="from-green-500 to-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
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

/* ------------------ COMPONENTS ------------------ */

const FeaturePill = ({ icon, text, color }) => {
  const colors = {
    yellow: 'from-yellow-400 to-orange-500',
    green: 'from-green-400 to-emerald-500',
    blue: 'from-blue-400 to-indigo-500',
    red: 'from-red-400 to-pink-500'
  };

  return (
    <div className={`flex items-center gap-2 md:gap-3 px-4 sm:px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 bg-gradient-to-r ${colors[color]} text-white rounded-full shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base md:text-lg transform hover:scale-110 active:scale-95 transition-all duration-300`}>
      {React.cloneElement(icon, { className: 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 flex-shrink-0' })}
      <span className="whitespace-nowrap">{text}</span>
    </div>
  );
};

const TrendingCard = ({ product, rank, onClick }) => (
  <button
    onClick={onClick}
    className="group relative bg-white rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg hover:shadow-2xl active:scale-98 transition-all duration-300 text-left overflow-hidden"
  >
    <div className="absolute top-2 md:top-4 right-2 md:right-4 w-7 h-7 md:w-10 md:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs md:text-base">
      #{rank}
    </div>

    <div className="pr-8 md:pr-12">
      <h3 className="text-sm md:text-lg font-bold text-gray-800 mb-2 md:mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[2.5rem] md:min-h-[3rem]">
        {product.name}
      </h3>
      <div className="flex items-center justify-between mb-2 md:mb-4">
        {product.lowestPrice?.price && (
          <div>
            <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Starting at</p>
            <p className="text-base md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ₹{product.lowestPrice.price}
            </p>
          </div>
        )}
        <div className="text-right">
          <p className="text-[10px] md:text-xs text-gray-500 mb-0.5 md:mb-1">Searches</p>
          <p className="text-sm md:text-lg font-bold text-gray-800">{product.searches}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2 text-indigo-600 font-semibold text-[11px] md:text-sm group-hover:gap-2 md:group-hover:gap-3 transition-all">
        <span>Compare Prices</span>
        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl md:rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10"></div>
  </button>
);

const StepCard = ({ step, icon, title, description, color }) => (
  <div className="relative bg-white rounded-xl md:rounded-2xl p-4 md:p-8 shadow-lg hover:shadow-2xl active:scale-98 transition-all duration-300 group">
    <div className={`absolute -top-2 -left-2 md:-top-4 md:-left-4 w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br ${color} rounded-full flex items-center justify-center text-white font-bold text-base md:text-xl shadow-lg`}>
      {step}
    </div>

    <div className={`inline-flex items-center justify-center w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br ${color} rounded-xl md:rounded-2xl text-white mb-3 md:mb-6 group-hover:scale-110 active:scale-95 transition-transform duration-300`}>
      {icon}
    </div>

    <h3 className="text-base md:text-xl font-bold text-gray-800 mb-1.5 md:mb-3">{title}</h3>
    <p className="text-xs md:text-base text-gray-600">{description}</p>

    {step < 3 && (
      <div className="hidden lg:block absolute top-1/2 -right-4 text-gray-300">
        <ArrowRight className="w-8 h-8" />
      </div>
    )}
  </div>
);

export default Home;