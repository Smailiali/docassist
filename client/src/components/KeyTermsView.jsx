export default function KeyTermsView({ terms, loading, onExtract }) {
  if (loading) return <div className="p-6 text-gray-400 text-sm">Extracting key terms...</div>;
  if (!terms) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 text-sm mb-4">No key terms extracted yet.</p>
        <button
          onClick={onExtract}
          className="bg-[#2E75B6] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Extract Key Terms
        </button>
      </div>
    );
  }
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Key Terms</h2>
      {/* TODO: render grouped terms */}
      <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto">{JSON.stringify(terms, null, 2)}</pre>
    </div>
  );
}
