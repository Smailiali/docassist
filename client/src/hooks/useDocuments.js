import { useState, useEffect } from 'react';
import { getDocuments, uploadDocument, deleteDocument } from '../services/api.js';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function upload(file) {
    const doc = await uploadDocument(file);
    setDocuments((prev) => [doc, ...prev]);
    return doc;
  }

  async function remove(id) {
    await deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  return { documents, loading, error, upload, remove, refresh: fetchDocuments };
}
