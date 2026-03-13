const BASE = 'http://localhost:3001/api';

export async function getDocuments() {
  const res = await fetch(`${BASE}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function getDocument(id) {
  const res = await fetch(`${BASE}/documents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch document');
  return res.json();
}

export async function uploadDocument(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/documents/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function deleteDocument(id) {
  const res = await fetch(`${BASE}/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export async function getMessages(documentId) {
  const res = await fetch(`${BASE}/documents/${documentId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

// Returns a raw Response for SSE streaming
export function sendChatMessage(documentId, message) {
  return fetch(`${BASE}/documents/${documentId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

export async function generateSummary(documentId) {
  const res = await fetch(`${BASE}/documents/${documentId}/summary`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate summary');
  return res.json();
}

export async function extractTerms(documentId) {
  const res = await fetch(`${BASE}/documents/${documentId}/terms`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to extract terms');
  return res.json();
}

export async function extractDeadlines(documentId) {
  const res = await fetch(`${BASE}/documents/${documentId}/deadlines`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to extract deadlines');
  return res.json();
}

export function exportDocument(documentId) {
  window.open(`${BASE}/documents/${documentId}/export`, '_blank');
}
