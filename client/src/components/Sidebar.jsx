import { useState } from 'react';
import { Trash2 } from 'lucide-react';

function SkeletonItem() {
  return (
    <div className="px-3 py-2 mb-1 rounded-lg animate-pulse">
      <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-2.5 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

export default function Sidebar({ documents, selectedId, onSelect, onUpload, onDelete, loading }) {
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(e, id) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onUpload}
          className="w-full bg-[#2E75B6] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Upload PDF
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        ) : documents.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-8 px-4">
            No documents yet. Upload a PDF to get started.
          </p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className={`group flex items-start rounded-lg mb-1 transition-colors ${
                doc.id === selectedId ? 'bg-blue-100' : 'hover:bg-gray-200'
              }`}
            >
              <button
                onClick={() => onSelect(doc)}
                className="flex-1 text-left px-3 py-2 text-sm min-w-0"
              >
                <div className={`truncate font-medium ${doc.id === selectedId ? 'text-blue-800' : 'text-gray-700'}`}>
                  {doc.title}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {doc.page_count ? `${doc.page_count} pages` : ''} ·{' '}
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </button>
              <button
                onClick={(e) => handleDelete(e, doc.id)}
                disabled={deletingId === doc.id}
                className="shrink-0 p-2 mt-1 mr-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                title="Delete document"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
}
