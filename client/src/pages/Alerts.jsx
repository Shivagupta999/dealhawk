import React, { useEffect, useState } from 'react';
import {
  Bell,
  Trash2,
  Loader2,
  TrendingDown,
  Package,
  Zap,
  Target,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import alertService from '../services/alertService';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await alertService.getAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alertId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this alert?'
    );
    if (!confirmed) return;

    setDeletingId(alertId);
    try {
      await alertService.deleteAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
            <Bell className="w-10 h-10 text-indigo-600 absolute top-5 left-5" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-5 sm:mb-6 md:mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <Bell className="h-7 w-7 sm:h-9 sm:w-9 md:h-10 md:w-10 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                  Price Alerts
                </h1>
                <p className="text-green-100 text-sm sm:text-base md:text-lg">
                  Get notified when prices drop to your target
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <StatCard
                icon={<Bell className="w-5 h-5" />}
                value={alerts.length}
                label="Active Alerts"
              />
              <StatCard
                icon={<Target className="w-5 h-5" />}
                value={alerts.filter(a => a.currentPrice <= a.targetPrice).length}
                label="Target Reached"
              />
              <StatCard
                icon={<Zap className="w-5 h-5" />}
                value={alerts.length > 0 ? "24/7" : "—"}
                label="Monitoring"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 p-6 flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-800 mb-1">Error Loading Alerts</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {alerts.length === 0 && !error ? (
          <div className="rounded-3xl bg-white py-16 text-center shadow-xl">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-6">
              <Bell className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-gray-800">
              No Active Alerts
            </h2>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Create alerts to get notified when your favorite products drop to your target price!
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Zap className="w-5 h-5" />
              Search Products
            </a>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert) => {
              const savings = alert.currentPrice - alert.targetPrice;
              const percentage = Math.round(
                (1 - alert.targetPrice / alert.currentPrice) * 100
              );
              const isTargetReached = alert.currentPrice <= alert.targetPrice;

              return (
                <div
                  key={alert._id}
                  className={`group relative rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${isTargetReached ? 'ring-2 ring-green-400 ring-offset-2' : ''
                    }`}
                >
                  {isTargetReached && (
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur opacity-75 animate-pulse"></div>
                        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-full shadow-xl flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-current" />
                          <span>Target Hit!</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-5">
                    <div className="flex gap-4 mb-4">
                      {alert.imageUrl ? (
                        <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                          <img
                            src={alert.imageUrl}
                            alt={alert.productName}
                            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                          <Package className="w-10 h-10 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="mb-2 line-clamp-2 font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                          {alert.productName}
                        </h3>
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wide">
                          {alert.website}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">
                          Current
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          ₹{alert.currentPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">
                          Target
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{alert.targetPrice}
                        </p>
                      </div>
                    </div>

                    {savings > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-5 w-5" />
                          <span className="font-bold text-sm">
                            Potential Savings
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{savings}</p>
                          <p className="text-xs opacity-90">{percentage}% off</p>
                        </div>
                      </div>
                    )}

                    {isTargetReached && (
                      <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 animate-pulse" />
                          <span className="font-bold text-sm">
                            Price target reached! Buy now!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {alert.url && (
                      <a
                        href={alert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
                      >
                        <span>View Deal</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(alert._id)}
                      disabled={deletingId === alert._id}
                      className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === alert._id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10"></div>
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

export default Alerts;