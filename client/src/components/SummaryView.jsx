import { useEffect } from 'react';
import { RefreshCw, BookOpen } from 'lucide-react';

function SkeletonLoader() {
  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50 animate-pulse">
    <div className="max-w-3xl">
      <div className="h-5 bg-gray-200 rounded w-1/4 mb-6" />
      <div className="space-y-3 mb-6">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-11/12" />
        <div className="h-3 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/5 mb-3" />
      <div className="flex gap-2 mb-6">
        <div className="h-6 bg-gray-200 rounded-full w-24" />
        <div className="h-6 bg-gray-200 rounded-full w-32" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/5 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-3/5" />
      </div>
    </div>
    </div>
  );
}

export default function SummaryView({ summary, loading, error, onGenerate, onRegenerate }) {
  // Auto-load when the tab is opened
  useEffect(() => {
    if (!summary && !loading && !error) {
      onGenerate();
    }
  }, []);

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="p-6 max-w-3xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={onGenerate}
            className="ml-4 text-sm text-[#2E75B6] hover:underline shrink-0 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6 bg-gray-50">
        <BookOpen size={48} className="text-gray-300" />
        <p className="text-gray-500 font-medium">Summary not generated yet</p>
        <p className="text-gray-400 text-sm">AI will analyze and summarize this document for you</p>
        <button
          onClick={onGenerate}
          className="bg-[#2E75B6] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-[#245d94] hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 cursor-pointer"
        >
          Generate Summary
        </button>
      </div>
    );
  }

  const { document_type, overview, parties = [], key_topics = [] } = summary;

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-3xl bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200">

        {/* Document type badge */}
        {document_type && (
          <span className="inline-block bg-blue-50 text-[#2E75B6] text-xs font-medium px-3 py-1 rounded-full mb-4">
            {document_type}
          </span>
        )}

        {/* Overview */}
        {overview && (
          <section className="mb-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 border-l-[5px] border-[#2E75B6] pl-3">Overview</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{overview}</p>
          </section>
        )}

        {/* Parties */}
        {parties.length > 0 && (
          <section className="mb-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 border-l-[5px] border-[#2E75B6] pl-3">Parties Involved</h3>
            <div className="flex flex-wrap gap-2">
              {parties.map((party, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full shadow-sm"
                >
                  {party}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Key Topics */}
        {key_topics.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 border-l-[5px] border-[#2E75B6] pl-3">Key Topics</h3>
            <ul className="space-y-1">
              {key_topics.map((topic, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-[#2E75B6] shrink-0" />
                  {topic}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Regenerate */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 rounded"
          >
            <RefreshCw size={12} />
            Regenerate summary
          </button>
        </div>
      </div>
    </div>
  );
}
