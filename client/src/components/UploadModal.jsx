import { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function UploadModal({ onUpload, onClose }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported. Please select a .pdf file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File must be under 10MB. Please choose a smaller PDF.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await onUpload(file);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process document. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-lg font-semibold mb-6">Upload a PDF</h2>

        <div
          onDragOver={(e) => { e.preventDefault(); if (!uploading) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); if (!uploading) handleFile(e.dataTransfer.files[0]); }}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors duration-150 ${
            uploading
              ? 'border-[#2E75B6] bg-blue-50 cursor-default'
              : dragging
              ? 'border-[#2E75B6] bg-blue-50 cursor-pointer'
              : 'border-gray-300 hover:border-[#2E75B6] cursor-pointer'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="animate-spin text-[#2E75B6]" />
              <p className="text-[#2E75B6] text-sm font-medium">Uploading and extracting text…</p>
              <p className="text-gray-400 text-xs">This may take a few seconds</p>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm">Drag & drop a PDF here, or click to browse</p>
              <p className="text-gray-400 text-xs mt-2">PDF only · Max 10MB</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-3">⚠ {error}</p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 transition-colors duration-150 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
