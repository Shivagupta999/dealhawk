import React, { useEffect, useState } from 'react';
import {
  Heart,
  TrendingDown,
  TrendingUp,
  Trash2,
  ExternalLink,
  Loader2,
  Package,
  AlertCircle,
  Sparkles,
  BarChart3,
  ShoppingCart
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import wishlistService from '../services/wishlistService';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  /* ------------------ Fetch Wishlist ------------------ */
  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await wishlistService.getWishlist();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        'Failed to load wishlist'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Remove Item ------------------ */
  const handleRemove = async (itemId) => {
    const confirmed = window.confirm(
      'Remove this item from wishlist?'
    );
    if (!confirmed) return;

    setDeletingId(itemId);
    try {
      await wishlistService.removeFromWishlist(itemId);
      setWishlist((prev) =>
        prev.filter((item) => item._id !== itemId)
      );
    } catch (err) {
      alert(
        err?.response?.data?.message ||
        'Failed to remove item'
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ------------------ Helpers ------------------ */
  const calculatePriceChange = (item) => {
    if (
      !Array.isArray(item.priceHistory) ||
      item.priceHistory.length < 2
    )
      return 0;

    const first = item.priceHistory[0]?.price;
    if (!first) return 0;

    return (
      ((item.currentPrice - first) / first) * 100
    );
  };

  const getLowestPrice = (item) => {
    if (!Array.isArray(item.priceHistory)) return null;

    const prices = item.priceHistory
      .map((p) => p.price)
      .filter(Boolean);

    return prices.length ? Math.min(...prices) : null;
  };

  const getTotalValue = () => {
    return wishlist.reduce((sum, item) => sum + (item.currentPrice || 0), 0);
  };

  const getItemsWithPriceDrop = () => {
    return wishlist.filter(item => calculatePriceChange(item) < 0).length;
  };

  /* ------------------ Loading ------------------ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-red-200 rounded-full animate-spin border-t-red-600"></div>
            <Heart className="w-10 h-10 text-red-600 absolute top-5 left-5 fill-current" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-5 sm:mb-6 md:mb-8 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <Heart className="h-7 w-7 sm:h-10 sm:w-10 text-white fill-current animate-pulse" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                  My Wishlist
                </h1>
                <p className="text-pink-100 text-sm sm:text-base md:text-lg">
                  Track prices and never miss a deal
                </p>
              </div>
            </div>


            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <StatCard
                icon={<Heart className="w-5 h-5 fill-current" />}
                value={wishlist.length}
                label="Saved Items"
              />
              <StatCard
                icon={<TrendingDown className="w-5 h-5" />}
                value={getItemsWithPriceDrop()}
                label="Price Drops"
              />
              <StatCard
                icon={<ShoppingCart className="w-5 h-5" />}
                value={`₹${getTotalValue()}`}
                label="Total Value"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 p-6 flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-800 mb-1">Error Loading Wishlist</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {wishlist.length === 0 ? (
          <div className="rounded-3xl bg-white py-16 text-center shadow-xl">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full mb-6">
              <Heart className="h-16 w-16 text-red-600" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-gray-800">
              Your Wishlist is Empty
            </h2>
            <p className="mb-8 text-gray-600 text-lg max-w-md mx-auto">
              Start adding products to track their prices and get the best deals!
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid gap-6">
            {wishlist.map((item) => {
              const priceChange = calculatePriceChange(item);
              const isDown = priceChange < 0;
              const lowestPrice = getLowestPrice(item);
              const hasHistory = item.priceHistory && item.priceHistory.length > 1;

              return (
                <div
                  key={item._id}
                  className="group rounded-3xl bg-white p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Product Info */}
                    <div className="lg:col-span-1">
                      <div className="flex gap-4">
                        {item.imageUrl ? (
                          <div className="w-28 h-28 rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                            <Package className="w-12 h-12 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="mb-2 line-clamp-2 font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                            {item.productName}
                          </h3>
                          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide mb-3">
                            {item.website}
                          </span>

                          {/* Current Price */}
                          <div className="space-y-2">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                ₹{item.currentPrice}
                              </span>

                              {priceChange !== 0 && (
                                <span
                                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold ${isDown
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                  {isDown ? (
                                    <TrendingDown className="h-4 w-4" />
                                  ) : (
                                    <TrendingUp className="h-4 w-4" />
                                  )}
                                  {Math.abs(priceChange).toFixed(1)}%
                                </span>
                              )}
                            </div>

                            {lowestPrice && lowestPrice < item.currentPrice && (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-semibold">
                                <Sparkles className="w-4 h-4" />
                                <span>Lowest was ₹{lowestPrice}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 text-sm font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              <span>Buy Now</span>
                              <ExternalLink className="h-4 w-4" />
                            </a>

                            <button
                              onClick={() => handleRemove(item._id)}
                              disabled={deletingId === item._id}
                              className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingId === item._id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price History Chart */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                          Price History
                        </h4>
                      </div>

                      {hasHistory ? (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4">
                          <ResponsiveContainer width="100%" height={180}>
                            <LineChart
                              data={item.priceHistory.map((h) => ({
                                date: new Date(h.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                }),
                                price: h.price
                              }))}
                            >
                              <defs>
                                <linearGradient id={`gradient-${item._id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                                stroke="#D1D5DB"
                              />
                              <YAxis
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                                stroke="#D1D5DB"
                                domain={['dataMin - 100', 'dataMax + 100']}
                              />
                              <Tooltip
                                formatter={(v) => [`₹${v}`, 'Price']}
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: 'none',
                                  borderRadius: '12px',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="price"
                                stroke="#6366F1"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#6366F1', strokeWidth: 2, stroke: 'white' }}
                                activeDot={{ r: 6 }}
                                fill={`url(#gradient-${item._id})`}
                              />
                            </LineChart>
                          </ResponsiveContainer>

                          {/* Price Stats */}
                          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1 font-semibold">Current</p>
                              <p className="text-lg font-bold text-gray-900">₹{item.currentPrice}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1 font-semibold">Lowest</p>
                              <p className="text-lg font-bold text-green-600">₹{lowestPrice || item.currentPrice}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1 font-semibold">Change</p>
                              <p className={`text-lg font-bold ${isDown ? 'text-green-600' : 'text-red-600'}`}>
                                {priceChange !== 0 ? `${isDown ? '-' : '+'}${Math.abs(priceChange).toFixed(1)}%` : '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[180px] rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                          <BarChart3 className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="text-sm font-medium text-gray-500">
                            Not enough price data yet
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Check back in a few days
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

/* ------------------ Stat Card ------------------ */
const StatCard = ({ icon, value, label }) => (
  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-white">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <span className="text-2xl font-bold">{value}</span>
    </div>
    <p className="text-sm opacity-90">{label}</p>
  </div>
);

export default Wishlist;