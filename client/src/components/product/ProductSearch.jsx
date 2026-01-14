import React, { useCallback, useState } from 'react';
import { Search, Filter, ArrowUpDown, Loader2, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import { WEBSITES, SORT_OPTIONS } from '../../utils/constants';

const ProductSearch = ({ onSearch, loading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const [sortBy, setSortBy] = useState('price');
  const [showFilters, setShowFilters] = useState(false);

  /* ------------------ Submit ------------------ */
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const query = searchQuery.trim();
      if (!query || loading) return;

      onSearch({
        productName: query,
        websites: selectedWebsites.length ? selectedWebsites : undefined,
        sortBy
      });
    },
    [searchQuery, selectedWebsites, sortBy, onSearch, loading]
  );

  /* ------------------ Toggle Website ------------------ */
  const toggleWebsite = (website) => {
    setSelectedWebsites((prev) =>
      prev.includes(website)
        ? prev.filter((w) => w !== website)
        : [...prev, website]
    );
  };

  const clearFilters = () => {
    setSelectedWebsites([]);
  };

  const selectAllWebsites = () => {
    setSelectedWebsites(WEBSITES.map(w => w.value));
  };

  return (
    <div className="relative">
      {/* Main Search Card */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 rounded-full blur-3xl opacity-30 -z-0"></div>
        
        <form onSubmit={handleSubmit} className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Search Products</h3>
                <p className="text-sm text-gray-500">Compare prices across multiple stores</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">
                {showFilters ? 'Hide' : 'Show'} Filters
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6 z-10 group-hover:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for laptops, phones, cameras..."
                className="relative w-full pl-14 pr-4 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-400 hover:border-gray-300"
                disabled={loading}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="relative px-10 py-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 overflow-hidden group hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {loading ? (
                <span className="relative z-10 flex items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="hidden sm:inline">Searching...</span>
                </span>
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="hidden sm:inline">Find Deals</span>
                  <span className="sm:hidden">Find Deals</span>
                </span>
              )}
            </button>
          </div>

          {/* Filters Section */}
          <div className={`overflow-hidden transition-all duration-500 ${
            showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="space-y-5 pt-4 border-t border-gray-100">
              {/* Website Filters */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-bold text-gray-800">
                      Filter by Website
                    </span>
                    {selectedWebsites.length > 0 && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                        {selectedWebsites.length} selected
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedWebsites.length < WEBSITES.length && (
                      <button
                        type="button"
                        onClick={selectAllWebsites}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                      >
                        Select All
                      </button>
                    )}
                    {selectedWebsites.length > 0 && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {WEBSITES.map((website) => {
                    const isSelected = selectedWebsites.includes(website.value);
                    return (
                      <button
                        key={website.value}
                        type="button"
                        onClick={() => toggleWebsite(website.value)}
                        className={`group relative px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl blur opacity-50"></div>
                        )}
                        <span className="relative flex items-center gap-2">
                          <span className="text-lg">{website.logo}</span>
                          <span>{website.name}</span>
                          {isSelected && (
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-bold text-gray-800">Sort By</span>
                </div>
                
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    disabled={loading}
                    className="appearance-none pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500 bg-white disabled:opacity-50 cursor-pointer hover:border-gray-300 transition-colors"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Active Filters Display */}
              {selectedWebsites.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Active:
                  </span>

                  {selectedWebsites.map((website) => {
                    const info = WEBSITES.find((w) => w.value === website);
                    return (
                      <span
                        key={website}
                        className="group px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-indigo-100 transition-colors"
                      >
                        <span>{info?.logo}</span>
                        <span>{info?.name}</span>
                        <button
                          type="button"
                          onClick={() => toggleWebsite(website)}
                          className="ml-1 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Quick Search Suggestions */}
      {!loading && !searchQuery && (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-gray-800">Popular Searches</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Laptop', 'iPhone', 'Headphones', 'Camera', 'Smartwatch'].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setSearchQuery(suggestion)}
                className="px-4 py-2 bg-white hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded-xl text-sm font-medium transition-all hover:shadow-md hover:scale-105"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;