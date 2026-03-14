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

export async function generateSummary(documentId, force = false) {
  const url = `${BASE}/documents/${documentId}/summary${force ? '?force=true' : ''}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate summary');
  return res.json();
}

export async function extractTerms(documentId, force = false) {
  const url = `${BASE}/documents/${documentId}/terms${force ? '?force=true' : ''}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to extract key terms');
  return res.json();
}

export async function extractDeadlines(documentId, force = false) {
  const url = `${BASE}/documents/${documentId}/deadlines${force ? '?force=true' : ''}`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to extract deadlines');
  return res.json();
}

export function exportDocument(documentId) {
  window.open(`${BASE}/documents/${documentId}/export`, '_blank');
}
