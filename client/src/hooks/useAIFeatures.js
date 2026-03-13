import { useState } from 'react';
import { generateSummary, extractTerms, extractDeadlines } from '../services/api.js';

export function useAIFeatures(documentId) {
  const [summary, setSummary] = useState(null);
  const [terms, setTerms] = useState(null);
  const [deadlines, setDeadlines] = useState(null);
  const [loading, setLoading] = useState({ summary: false, terms: false, deadlines: false });

  async function fetchSummary() {
    setLoading((prev) => ({ ...prev, summary: true }));
    try {
      const data = await generateSummary(documentId);
      setSummary(data);
    } finally {
      setLoading((prev) => ({ ...prev, summary: false }));
    }
  }

  async function fetchTerms() {
    setLoading((prev) => ({ ...prev, terms: true }));
    try {
      const data = await extractTerms(documentId);
      setTerms(data);
    } finally {
      setLoading((prev) => ({ ...prev, terms: false }));
    }
  }

  async function fetchDeadlines() {
    setLoading((prev) => ({ ...prev, deadlines: true }));
    try {
      const data = await extractDeadlines(documentId);
      setDeadlines(data);
    } finally {
      setLoading((prev) => ({ ...prev, deadlines: false }));
    }
  }

  return { summary, terms, deadlines, loading, fetchSummary, fetchTerms, fetchDeadlines };
}
