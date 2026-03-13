import { useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';

// Category → badge color mapping
const CATEGORY_STYLES = {
  person:       'bg-blue-50 text-blue-700',
  organization: 'bg-orange-50 text-orange-700',
  date:         'bg-amber-50 text-amber-700',
  money:        'bg-green-50 text-green-700',
  legal_term:   'bg-purple-50 text-purple-700',
  location:     'bg-teal-50 text-teal-700',
};

function categoryStyle(category) {
  return CATEGORY_STYLES[category?.toLowerCase()] ?? 'bg-gray-100 text-gray-600';
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
      </div>
    </div>
  );
}

export default function KeyTermsView({ terms, loading, error, onGenerate, onRegenerate }) {
  const [query, setQuery] = useState('');

  // Auto-load on tab open
  useEffect(() => {
    if (!terms && !loading && !error) {
      onGenerate();
    }
  }, []);

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-4xl">
          <div className="h-9 bg-gray-200 rounded-lg w-full mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={onGenerate}
            className="ml-4 text-sm text-[#2E75B6] hover:underline shrink-0"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!terms) return null;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? terms.filter(
        (t) =>
          t.term?.toLowerCase().includes(q) ||
          t.context?.toLowerCase().includes(q)
      )
    : terms;

  const countLabel =
    q && filtered.length !== terms.length
      ? `${filtered.length} of ${terms.length} terms`
      : `${terms.length} term${terms.length !== 1 ? 's' : ''}`;

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-4xl">

        {/* Search bar + count */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by term or context..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#2E75B6] bg-white"
            />
          </div>
          <span className="text-xs text-gray-400 shrink-0">{countLabel}</span>
        </div>

        {/* Term cards grid */}
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">No terms match your filter.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {filtered.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {item.category && (
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${categoryStyle(item.category)}`}>
                    {item.category.replace('_', ' ')}
                  </span>
                )}
                <p className="font-semibold text-gray-800 text-sm mb-1">{item.term}</p>
                {item.context && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">"{item.context}"</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Regenerate */}
        <div className="pt-2">
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw size={12} />
            Regenerate key terms
          </button>
        </div>
      </div>
    </div>
  );
}
