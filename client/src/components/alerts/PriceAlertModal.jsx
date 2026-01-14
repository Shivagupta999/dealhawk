import React, { useEffect, useMemo, useState } from 'react';
import { X, Bell, TrendingDown, Bug } from 'lucide-react';
import alertService from '../../services/alertService';
import { validateTargetPrice } from '../../utils/alertValidation';
import { normalizeProduct } from '../../utils/normalizeProduct';

const PriceAlertModal = ({ product, onClose, onSuccess }) => {
  
  useEffect(() => {
  }, [product]);

  const normalizedProduct = useMemo(
    () => {
      const normalized = normalizeProduct(product);
      return normalized;
    },
    [product]
  );

  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [loading, onClose]);

  const suggestedPrices = useMemo(() => {
    const price = normalizedProduct.price;
    return [
      Math.round(price * 0.9),
      Math.round(price * 0.8),
      Math.round(price * 0.7)
    ];
  }, [normalizedProduct.price]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateTargetPrice(
      targetPrice,
      normalizedProduct.price
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    const alertData = {
      productName: normalizedProduct.name,
      targetPrice: Number(targetPrice),
      currentPrice: normalizedProduct.price,
      website: normalizedProduct.website,
      url: normalizedProduct.url,
      imageUrl: normalizedProduct.imageUrl
    };

    try {
      await alertService.createAlert(alertData);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('❌ Alert creation failed:', err);
      setError(
        err?.response?.data?.message ||
          'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-alert-title"
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6"
      >
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2
              id="price-alert-title"
              className="text-2xl font-bold text-gray-800"
            >
              Set Price Alert
            </h2>
            <p className="text-sm text-gray-600">
              Get notified when the price drops
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-xl bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-3">
            {normalizedProduct.imageUrl && (
              <img
                src={normalizedProduct.imageUrl}
                alt={normalizedProduct.name}
                className="h-16 w-16 object-contain"
              />
            )}
            <div className="flex-1">
              <p className="line-clamp-2 text-sm font-semibold text-gray-800">
                {normalizedProduct.name}
              </p>
              <p className="text-xs text-gray-500">
                {normalizedProduct.website}
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-600">Current Price:</span>
            <span className="text-2xl font-bold text-gray-900">
              ₹{normalizedProduct.price}
            </span>
          </div>

          {normalizedProduct.price > 1000 && product?.originalPrice && normalizedProduct.price === product.originalPrice && (
            <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3">
              <div className="flex items-start gap-2">
                <div className="text-red-600 text-xs">
                  ⚠️ <strong>Warning:</strong> Current price equals original price. 
                  This might be incorrect. Expected selling price: ₹{product.price || 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="target-price"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Target Price (₹)
            </label>
            <input
              id="target-price"
              type="number"
              inputMode="decimal"
              pattern="[0-9]*"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Enter your target price"
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-lg focus:border-green-500 focus:outline-none"
            />
          </div>
          <div className="mb-6">
            <p className="mb-2 text-sm text-gray-600">Quick suggestions:</p>
            <div className="flex gap-2">
              {suggestedPrices.map((price) => (
                <button
                  key={price}
                  type="button"
                  onClick={() => setTargetPrice(price.toString())}
                  className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium transition hover:bg-gray-200"
                >
                  ₹{price}
                  <span className="block text-xs text-gray-500">
                    {Math.round(
                      (1 - price / normalizedProduct.price) * 100
                    )}
                    % off
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Creating Alert...' : 'Create Alert'}
          </button>
        </form>

        <div className="mt-4 rounded-lg bg-blue-50 p-3">
          <div className="flex items-start gap-2">
            <TrendingDown className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <p className="text-sm text-blue-800">
              We'll notify you via email when the price drops to or below your
              target price.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceAlertModal;