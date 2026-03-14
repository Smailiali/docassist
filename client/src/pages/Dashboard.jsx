import { useState } from 'react';
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

const TABS = ['Chat', 'Summary', 'Key Terms', 'Deadlines'];

export default function Dashboard() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('Chat');
  const [showUpload, setShowUpload] = useState(false);

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
  }

  async function handleDelete(id) {
    await remove(id);
    if (selectedDoc?.id === id) setSelectedDoc(null);
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          documents={documents}
          selectedId={selectedDoc?.id}
          onSelect={setSelectedDoc}
          onUpload={() => setShowUpload(true)}
          onDelete={handleDelete}
          loading={docsLoading}
          error={docsError}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedDoc ? (
            <>
              {/* Tab bar */}
              <div className="border-b border-gray-200 bg-white px-6 flex gap-1 shrink-0">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-[#2E75B6] text-[#2E75B6]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
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
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a document from the sidebar or upload a new one to get started.
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
