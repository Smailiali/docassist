export default function Sidebar({ documents, selectedId, onSelect, onUpload }) {
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
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onSelect(doc)}
            className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${
              doc.id === selectedId
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="truncate font-medium">{doc.title}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {doc.page_count ? `${doc.page_count} pages` : ''} ·{' '}
              {new Date(doc.created_at).toLocaleDateString()}
            </div>
          </button>
        ))}
        {documents.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-8 px-4">
            No documents yet. Upload a PDF to get started.
          </p>
        )}
      </nav>
    </aside>
  );
}
