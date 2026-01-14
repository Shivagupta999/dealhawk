import React, { useMemo, useState } from 'react';
import {
  Star,
  Clock,
  ExternalLink,
  Heart,
  Package,
  Bell,
  TrendingDown,
  Zap,
  ShoppingCart
} from 'lucide-react';
import wishlistService from '../../services/wishlistService';

const ProductCard = ({
  product,
  isBestDeal = false,
  onAddToWishlist,
  onSetAlert
}) => {
  const [imageError, setImageError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  /* ------------------ Price Calculations ------------------ */
  const savingsData = useMemo(() => {
    const original = Number(product.originalPrice);
    const current = Number(product.price);

    if (!original || !current || original <= current) {
      return { savings: 0, percentage: 0 };
    }

    const savings = original - current;
    const percentage = Math.round((savings / original) * 100);

    return { savings, percentage };
  }, [product.originalPrice, product.price]);

  /* ------------------ Wishlist ------------------ */
  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (adding) return;

    setAdding(true);
    try {
      await wishlistService.addToWishlist({
        productName: product.title,
        website: product.website,
        currentPrice: product.price,
        url: product.url || null,
        imageUrl: product.imageUrl || null
      });

      if (onAddToWishlist) {
        await onAddToWishlist(product);
      }
    } catch (error) {
      alert(error?.message || 'Failed to add to wishlist');
    } finally {
      setAdding(false);
    }
  };

  /* ------------------ Alert ------------------ */
  const handleSetAlert = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSetAlert?.(product);
  };

  const { savings, percentage } = savingsData;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
        isBestDeal ? 'ring-4 ring-green-400 ring-offset-2' : ''
      }`}
    >
 
      {isBestDeal && (
        <div className="absolute top-4 left-4 z-20">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur opacity-75 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-1">
              <Zap className="w-4 h-4 fill-current animate-bounce" />
              <span>Best Deal</span>
            </div>
          </div>
        </div>
      )}

      {percentage > 0 && (
        <div className="absolute top-4 right-4 z-20 bg-gradient-to-br from-red-500 to-pink-600 text-white text-sm font-bold px-3 py-2 rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
          <div className="flex flex-col items-center">
            <TrendingDown className="w-4 h-4 mb-1" />
            <span>{percentage}% OFF</span>
          </div>
        </div>
      )}

      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 h-56 flex items-center justify-center overflow-hidden">
        {product.imageUrl && !imageError ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain p-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <Package className="w-16 h-16 mb-2 animate-pulse" />
            <span className="text-xs font-medium">No Image Available</span>
          </div>
        )}

        <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}></div>

        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <button
            onClick={handleSetAlert}
            title="Set Price Alert"
            className="bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg text-gray-600 hover:text-green-500 hover:scale-110 transition-all duration-300 hover:shadow-xl"
          >
            <Bell className="w-5 h-5" />
          </button>

          <button
            onClick={handleAddToWishlist}
            disabled={adding}
            title="Add to Wishlist"
            className="bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg text-gray-600 hover:text-red-500 hover:scale-110 transition-all duration-300 disabled:opacity-50 hover:shadow-xl"
          >
            <Heart className={`w-5 h-5 ${adding ? 'animate-pulse fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide">
            {product.website}
          </span>
          {product.rating && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-700">
                {product.rating}
              </span>
              {product.reviews && (
                <span className="text-xs text-gray-500">({product.reviews})</span>
              )}
            </div>
          )}
        </div>

        <h4 className="text-base font-bold text-gray-800 line-clamp-2 min-h-[3rem] mb-4 group-hover:text-indigo-600 transition-colors">
          {product.title}
        </h4>
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ₹{product.price}
            </span>

            {product.originalPrice && (
              <div className="flex flex-col">
                <span className="text-sm line-through text-gray-400">
                  ₹{product.originalPrice}
                </span>
              </div>
            )}
          </div>

          {percentage > 0 && (
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md">
                Save ₹{savings}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <span
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
              product.availability
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${product.availability ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            {product.availability ? 'In Stock' : 'Out of Stock'}
          </span>

          {product.deliveryTime && (
            <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg font-medium">
              <Clock className="w-3.5 h-3.5" />
              {product.deliveryTime}
            </span>
          )}
        </div>

        {product.url ? (
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3.5 rounded-xl font-bold overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
            <span className="relative z-10 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              View Deal
              <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </span>
          </a>
        ) : (
          <button
            disabled
            className="w-full py-3.5 rounded-xl bg-gray-200 text-gray-500 font-bold cursor-not-allowed"
          >
            Link Unavailable
          </button>
        )}
      </div>
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>
    </div>
  );
};

export default ProductCard;