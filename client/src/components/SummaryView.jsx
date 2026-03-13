export default function SummaryView({ summary, loading, onGenerate }) {
  if (loading) return <div className="p-6 text-gray-400 text-sm">Generating summary...</div>;
  if (!summary) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 text-sm mb-4">No summary yet.</p>
        <button
          onClick={onGenerate}
          className="bg-[#2E75B6] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Generate Summary
        </button>
      </div>
    );
  }
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Summary</h2>
      {/* TODO: render summary fields */}
      <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto">{JSON.stringify(summary, null, 2)}</pre>
    </div>
  );
}
