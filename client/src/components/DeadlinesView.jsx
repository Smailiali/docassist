import { useEffect } from 'react';
import { RefreshCw, CalendarClock, CalendarX2 } from 'lucide-react';

const URGENCY_DOT = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-green-500',
};

const URGENCY_LABEL = {
  high:   'text-red-600',
  medium: 'text-amber-600',
  low:    'text-green-600',
};

function urgencyDot(urgency) {
  return URGENCY_DOT[urgency?.toLowerCase()] ?? 'bg-gray-400';
}

function urgencyLabel(urgency) {
  return URGENCY_LABEL[urgency?.toLowerCase()] ?? 'text-gray-500';
}

function tryParseDate(str) {
  if (!str || str === 'Not specified') return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(str) {
  const d = tryParseDate(str);
  if (!d) return str;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function SkeletonRow() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="flex flex-col items-center shrink-0 w-28">
        <div className="h-6 bg-gray-200 rounded-full w-24" />
      </div>
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 mb-3">
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}

function DeadlineRow({ item }) {
  const parsedDate = tryParseDate(item.due_date);
  const dateDisplay = parsedDate ? formatDate(item.due_date) : item.due_date;
  const urgency = item.urgency?.toLowerCase() ?? 'low';

  return (
    <div className="flex gap-4">
      {/* Left: date chip + connector */}
      <div className="flex flex-col items-center shrink-0 w-28 pt-1">
        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-center leading-tight">
          {dateDisplay}
        </span>
        <div className="w-px flex-1 bg-gray-200 mt-2" />
      </div>

      {/* Right: card */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${urgencyDot(urgency)}`} />
          <span className={`text-xs font-medium capitalize ${urgencyLabel(urgency)}`}>{urgency}</span>
        </div>
        <p className="text-sm font-semibold text-gray-800 mb-1">{item.item}</p>
        {item.responsible_party && item.responsible_party !== 'Not specified' && (
          <p className="text-xs text-gray-500">Responsible: {item.responsible_party}</p>
        )}
      </div>
    </div>
  );
}

export default function DeadlinesView({ deadlines, loading, error, onGenerate, onRegenerate }) {
  // Auto-load on tab open
  useEffect(() => {
    if (!deadlines && !loading && !error) {
      onGenerate();
    }
  }, []);

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-2xl">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl">
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

  if (!deadlines) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6 bg-gray-50">
        <CalendarClock size={40} className="text-gray-300" />
        <p className="text-gray-500 text-sm">Deadlines not extracted yet</p>
        <button
          onClick={onGenerate}
          className="bg-[#2E75B6] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#245d94] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
        >
          Extract Deadlines
        </button>
      </div>
    );
  }

  if (deadlines.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-center px-6 bg-gray-50">
        <CalendarX2 size={40} className="text-gray-300" />
        <p className="text-gray-500 text-sm">No deadlines or time-sensitive obligations were found in this document.</p>
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors duration-150 focus:outline-none"
        >
          <RefreshCw size={12} />
          Regenerate
        </button>
      </div>
    );
  }

  // Split into absolute (parseable) and relative/unknown dates
  const absolute = deadlines
    .filter((d) => tryParseDate(d.due_date) !== null)
    .sort((a, b) => tryParseDate(a.due_date) - tryParseDate(b.due_date));

  const relative = deadlines.filter((d) => tryParseDate(d.due_date) === null);

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-2xl">

        {/* Absolute-date deadlines */}
        {absolute.length > 0 && (
          <div className="mb-2">
            {absolute.map((item, i) => (
              <DeadlineRow key={i} item={item} />
            ))}
          </div>
        )}

        {/* Relative / unparseable deadlines */}
        {relative.length > 0 && (
          <>
            {absolute.length > 0 && (
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3 mt-2">
                Relative Deadlines
              </p>
            )}
            <div>
              {relative.map((item, i) => (
                <DeadlineRow key={i} item={item} />
              ))}
            </div>
          </>
        )}

        {/* Regenerate */}
        <div className="pt-2">
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 rounded"
          >
            <RefreshCw size={12} />
            Regenerate deadlines
          </button>
        </div>

      </div>
    </div>
  );
}
