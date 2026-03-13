import { useState, useEffect } from 'react';
import { generateSummary, extractTerms, extractDeadlines } from '../services/api.js';

export function useAIFeatures(documentId) {
  const [summary, setSummary] = useState(null);
  const [terms, setTerms] = useState(null);
  const [deadlines, setDeadlines] = useState(null);
  const [loading, setLoading] = useState({ summary: false, terms: false, deadlines: false });
  const [error, setError] = useState({ summary: null, terms: null, deadlines: null });

  // Reset all AI data when the selected document changes
  useEffect(() => {
    setSummary(null);
    setTerms(null);
    setDeadlines(null);
    setLoading({ summary: false, terms: false, deadlines: false });
    setError({ summary: null, terms: null, deadlines: null });
  }, [documentId]);

  async function fetchSummary() {
    setLoading((prev) => ({ ...prev, summary: true }));
    setError((prev) => ({ ...prev, summary: null }));
    try {
      const data = await generateSummary(documentId);
      setSummary(data);
    } catch (err) {
      setError((prev) => ({ ...prev, summary: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, summary: false }));
    }
  }

  async function regenerateSummary() {
    setSummary(null);
    setLoading((prev) => ({ ...prev, summary: true }));
    setError((prev) => ({ ...prev, summary: null }));
    try {
      const data = await generateSummary(documentId, true);
      setSummary(data);
    } catch (err) {
      setError((prev) => ({ ...prev, summary: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, summary: false }));
    }
  }

  async function fetchTerms() {
    setLoading((prev) => ({ ...prev, terms: true }));
    setError((prev) => ({ ...prev, terms: null }));
    try {
      const data = await extractTerms(documentId);
      setTerms(data);
    } catch (err) {
      setError((prev) => ({ ...prev, terms: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, terms: false }));
    }
  }

  async function fetchDeadlines() {
    setLoading((prev) => ({ ...prev, deadlines: true }));
    setError((prev) => ({ ...prev, deadlines: null }));
    try {
      const data = await extractDeadlines(documentId);
      setDeadlines(data);
    } catch (err) {
      setError((prev) => ({ ...prev, deadlines: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, deadlines: false }));
    }
  }

  return {
    summary, terms, deadlines,
    loading, error,
    fetchSummary, regenerateSummary,
    fetchTerms, fetchDeadlines,
  };
}
