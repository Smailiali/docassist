import { useState } from 'react';
import { Trash2, Check, X } from 'lucide-react';

function SkeletonItem() {
  return (
    <div className="px-3 py-2 mb-1 rounded-lg animate-pulse">
      <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-2.5 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

export default function Sidebar({ documents, selectedId, onSelect, onUpload, onDelete, loading, error, isOpen }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function handleDeleteConfirm(e, id) {
    e.stopPropagation();
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <aside
      className={`
        w-64 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0
        fixed top-14 bottom-0 left-0 z-20
        lg:static lg:top-auto lg:bottom-auto lg:z-auto
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onUpload}
          className="w-full bg-[#2E75B6] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#245d94] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
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
        ) : error ? (
          <p className="text-xs text-red-400 text-center mt-8 px-4">
            Failed to load documents. Check your connection.
          </p>
        ) : documents.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-8 px-4">
            No documents yet.
          </p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className={`group flex items-start rounded-lg mb-1 transition-colors duration-150 border-l-2 ${
                doc.id === selectedId
                  ? 'bg-blue-50 border-[#2E75B6]'
                  : 'border-transparent hover:bg-gray-200'
              }`}
            >
              <button
                onClick={() => onSelect(doc)}
                className="flex-1 text-left px-3 py-2 text-sm min-w-0 focus:outline-none"
              >
                <div className={`truncate font-medium ${doc.id === selectedId ? 'text-[#2E75B6]' : 'text-gray-700'}`}>
                  {doc.title}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {doc.page_count ? `${doc.page_count} pages · ` : ''}
                  {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </button>

              {/* Delete: inline confirm or trash icon */}
              <div className="shrink-0 flex items-center mt-1 mr-1 gap-0.5">
                {confirmDeleteId === doc.id ? (
                  <>
                    <button
                      onClick={(e) => handleDeleteConfirm(e, doc.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors duration-150 focus:outline-none"
                      title="Confirm delete"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors duration-150 focus:outline-none"
                      title="Cancel"
                    >
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(doc.id); }}
                    disabled={deletingId === doc.id}
                    className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-150 disabled:opacity-50 focus:outline-none focus:opacity-100"
                    title="Delete document"
                  >
                    {deletingId === doc.id
                      ? <span className="text-xs text-gray-400 font-mono">…</span>
                      : <Trash2 size={14} />
                    }
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </nav>
    </aside>
  );
}
