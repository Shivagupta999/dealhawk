import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingDown,
  ExternalLink,
  Bell
} from 'lucide-react';
import ProductCard from './ProductCard';

const PriceComparison = ({ data, onCreateAlert, onAddToWishlist }) => {
  if (!data?.prices || data.prices.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-24 h-24 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          No Results Found
        </h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your search or filters
        </p>

        <ul className="text-sm text-gray-500 space-y-1">
          <li>• Remove some website filters</li>
          <li>• Try a different product name</li>
          <li>• Search without filters first</li>
        </ul>
      </div>
    );
  }

  const { prices, analytics } = data;

  const sortedPrices = useMemo(() => {
    return [...prices].sort(
      (a, b) =>
        (Number(a.price) || Infinity) -
        (Number(b.price) || Infinity)
    );
  }, [prices]);

  const bestDeal = sortedPrices[0];

  const calculatedAnalytics = useMemo(() => {
    if (analytics) return analytics;

    const values = sortedPrices
      .map(p => Number(p.price))
      .filter(p => !isNaN(p));

    if (values.length === 0) {
      return {
        lowestPrice: 0,
        averagePrice: 0,
        numberOfSites: 0,
        savingsPercent: 0
      };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg =
      values.reduce((sum, p) => sum + p, 0) /
      values.length;

    return {
      lowestPrice: min,
      averagePrice: Math.round(avg),
      numberOfSites: values.length,
      savingsPercent:
        max > 0
          ? Math.round(((max - min) / max) * 100)
          : 0
    };
  }, [analytics, sortedPrices]);

  const isValidUrl =
    bestDeal?.url &&
    bestDeal.url !== 'null' &&
    bestDeal.url !== 'undefined';

  /* ------------------ UI ------------------ */
  return (
    <div className="space-y-10">
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-6 h-6" />
          <h3 className="text-2xl font-bold">
            Price Analytics
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Lowest Price" value={`₹${calculatedAnalytics.lowestPrice}`} />
          <StatCard label="Average Price" value={`₹${calculatedAnalytics.averagePrice}`} />
          <StatCard label="Max Savings" value={`${calculatedAnalytics.savingsPercent}%`} />
          <StatCard label="Sites Compared" value={calculatedAnalytics.numberOfSites} />
        </div>
      </section>

      {bestDeal && (
        <section className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8" />
              <h2 className="text-2xl font-bold">
                Best Deal Found
              </h2>
            </div>

            {onCreateAlert && (
              <button
                onClick={() => onCreateAlert(bestDeal)}
                className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition"
              >
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Set Alert
                </span>
              </button>
            )}
          </div>

          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <p className="text-2xl font-bold">
                  {bestDeal.website}
                </p>
                <p className="text-sm opacity-90 line-clamp-1">
                  {bestDeal.title}
                </p>
              </div>
              <p className="text-4xl font-bold">
                ₹{bestDeal.price}
              </p>
            </div>

            {isValidUrl ? (
              <a
                href={bestDeal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white text-green-600 py-3 rounded-lg font-bold hover:bg-opacity-90 transition"
              >
                Shop Now
                <ExternalLink className="w-5 h-5" />
              </a>
            ) : (
              <button
                disabled
                className="w-full py-3 rounded-lg bg-white/40 cursor-not-allowed"
              >
                Link Not Available
              </button>
            )}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          All Available Options ({sortedPrices.length})
        </h3>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sortedPrices.map((product, index) => (
            <ProductCard
              key={`${product.website}-${product.title}-${index}`}
              product={product}
              isBestDeal={index === 0}
              onSetAlert={onCreateAlert}
              onAddToWishlist={onAddToWishlist}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

/* ------------------ Stat Card ------------------ */
const StatCard = ({ label, value }) => (
  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
    <p className="text-sm opacity-90 mb-1">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default PriceComparison;
