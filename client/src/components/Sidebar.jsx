import { useState } from 'react';
import { Trash2, Check, X, FileText, Plus, FolderOpen } from 'lucide-react';

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function SkeletonItem() {
  return (
    <div className="px-4 py-3 animate-pulse border-l-2 border-transparent">
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
        w-64 bg-slate-100 border-r border-gray-200 flex flex-col shrink-0
        fixed top-14 bottom-0 left-0 z-20
        lg:static lg:top-auto lg:bottom-auto lg:z-auto
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Sidebar brand */}
      <div className="px-5 py-4 border-b border-gray-200/80 flex items-center gap-2.5 shrink-0">
        <FileText size={18} className="text-[#2E75B6] shrink-0" />
        <span className="font-bold text-lg text-[#2E75B6] tracking-tight">DocAssist</span>
      </div>

      {/* Document list */}
      <nav className="flex-1 overflow-y-auto py-2 thin-scroll">
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
          <div className="flex flex-col items-center justify-center mt-10 px-4 text-center gap-2">
            <FolderOpen size={36} className="text-gray-300" />
            <p className="text-xs font-medium text-gray-500">No documents yet</p>
            <p className="text-xs text-gray-400 leading-relaxed">Upload a PDF to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`group flex items-start transition-all duration-150 border-l-[3px] ${
                  doc.id === selectedId
                    ? 'bg-blue-50/70 border-[#2E75B6]'
                    : 'border-transparent hover:bg-gray-100 hover:border-[#2E75B6]/50'
                }`}
              >
                <button
                  onClick={() => onSelect(doc)}
                  className="flex-1 text-left px-4 py-3 min-w-0 focus:outline-none"
                >
                  <div className={`truncate text-sm font-medium leading-snug ${
                    doc.id === selectedId ? 'text-[#2E75B6]' : 'text-gray-700'
                  }`}>
                    {doc.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                    {doc.page_count && <span>{doc.page_count}p</span>}
                    {doc.page_count && <span aria-hidden>·</span>}
                    <span>{relativeTime(doc.created_at)}</span>
                  </div>
                </button>

                {/* Delete controls */}
                <div className="shrink-0 flex items-center mt-2 mr-2 gap-0.5">
                  {confirmDeleteId === doc.id ? (
                    <>
                      <button
                        onClick={(e) => handleDeleteConfirm(e, doc.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-all duration-150 focus:outline-none"
                        title="Confirm delete"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-all duration-150 focus:outline-none"
                        title="Cancel"
                      >
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(doc.id); }}
                      disabled={deletingId === doc.id}
                      className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-150 disabled:opacity-50 focus:outline-none focus:opacity-100 cursor-pointer"
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
            ))}
          </div>
        )}
      </nav>

      {/* Upload button — dashed, anchored to bottom */}
      <div className="p-4 border-t border-gray-200/80 shrink-0">
        <button
          onClick={onUpload}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-[#2E75B6] text-gray-500 hover:text-[#2E75B6] rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 cursor-pointer"
        >
          <Plus size={16} />
          Upload PDF
        </button>
      </div>
    </aside>
  );
}
