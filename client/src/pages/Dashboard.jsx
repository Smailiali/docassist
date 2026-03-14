import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileDown, Loader2, UploadCloud } from 'lucide-react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ChatWindow from '../components/ChatWindow.jsx';
import SummaryView from '../components/SummaryView.jsx';
import KeyTermsView from '../components/KeyTermsView.jsx';
import DeadlinesView from '../components/DeadlinesView.jsx';
import UploadModal from '../components/UploadModal.jsx';
import { useDocuments } from '../hooks/useDocuments.js';
import { useChat } from '../hooks/useChat.js';
import { useAIFeatures } from '../hooks/useAIFeatures.js';
import { exportDocument } from '../services/api.js';

const TABS = ['Chat', 'Summary', 'Key Terms', 'Deadlines'];

export default function Dashboard() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('Chat');
  const [showUpload, setShowUpload] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const exportRef = useRef(null);

  // Close export dropdown on outside click
  useEffect(() => {
    if (!showExport) return;
    function handleClick(e) {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExport(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showExport]);

  const { documents, loading: docsLoading, error: docsError, upload, remove } = useDocuments();
  const { messages, streaming, thinking, sendMessage } = useChat(selectedDoc?.id);
  const {
    summary, terms, deadlines,
    loading: aiLoading, error: aiError,
    fetchSummary, regenerateSummary,
    fetchTerms, regenerateTerms,
    fetchDeadlines, regenerateDeadlines,
  } = useAIFeatures(selectedDoc?.id);

  async function handleUpload(file) {
    const doc = await upload(file);
    setSelectedDoc(doc);
    setActiveTab('Chat');
    setSidebarOpen(false);
  }

  async function handleDelete(id) {
    await remove(id);
    if (selectedDoc?.id === id) setSelectedDoc(null);
  }

  function handleExport(format) {
    setShowExport(false);
    setExporting(true);
    exportDocument(selectedDoc.id, format);
    setTimeout(() => setExporting(false), 2000);
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          documents={documents}
          selectedId={selectedDoc?.id}
          onSelect={(doc) => { setSelectedDoc(doc); setSidebarOpen(false); }}
          onUpload={() => { setShowUpload(true); setSidebarOpen(false); }}
          onDelete={handleDelete}
          loading={docsLoading}
          error={docsError}
          isOpen={sidebarOpen}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedDoc ? (
            <>
              {/* Tab bar */}
              <div className="border-b border-gray-200 bg-white px-6 flex items-center gap-1 shrink-0">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 rounded-t ${
                      activeTab === tab
                        ? 'border-[#2E75B6] text-[#2E75B6]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}

                {/* Export button + dropdown */}
                <div ref={exportRef} className="ml-auto relative flex items-center py-2">
                  <button
                    onClick={() => !exporting && setShowExport((v) => !v)}
                    disabled={exporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30 disabled:opacity-60"
                  >
                    {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    Export
                  </button>

                  {showExport && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                      <button
                        onClick={() => handleExport('pdf')}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <FileText size={14} className="text-gray-400" />
                        Export as PDF
                      </button>
                      <button
                        onClick={() => handleExport('text')}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <FileDown size={14} className="text-gray-400" />
                        Export as Text
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'Chat' && (
                  <ChatWindow key={selectedDoc.id} messages={messages} streaming={streaming} thinking={thinking} onSend={sendMessage} />
                )}
                {activeTab === 'Summary' && (
                  <SummaryView
                    summary={summary}
                    loading={aiLoading.summary}
                    error={aiError.summary}
                    onGenerate={fetchSummary}
                    onRegenerate={regenerateSummary}
                  />
                )}
                {activeTab === 'Key Terms' && (
                  <KeyTermsView
                    terms={terms}
                    loading={aiLoading.terms}
                    error={aiError.terms}
                    onGenerate={fetchTerms}
                    onRegenerate={regenerateTerms}
                  />
                )}
                {activeTab === 'Deadlines' && (
                  <DeadlinesView
                    deadlines={deadlines}
                    loading={aiLoading.deadlines}
                    error={aiError.deadlines}
                    onGenerate={fetchDeadlines}
                    onRegenerate={regenerateDeadlines}
                  />
                )}
              </div>
            </>
          ) : (
            /* No document selected — proper empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
              <UploadCloud size={48} className="text-gray-300" />
              <div>
                <p className="text-gray-600 font-medium">No document selected</p>
                <p className="text-gray-400 text-sm mt-1">Upload a PDF or select one from the sidebar to get started.</p>
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="mt-2 bg-[#2E75B6] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#245d94] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2E75B6]/30"
              >
                Upload PDF
              </button>
            </div>
          )}
        </main>
      </div>

      {showUpload && (
        <UploadModal onUpload={handleUpload} onClose={() => setShowUpload(false)} />
      )}
    </div>
  );
}
