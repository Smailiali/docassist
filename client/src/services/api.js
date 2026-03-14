const BASE = '/api';

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('Not authenticated');
  }
  return res;
}

// Auth
export async function getMe() {
  const res = await fetch(`${BASE}/auth/me`, { credentials: 'include' });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
}

export async function logout() {
  await fetch(`${BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
}

// Documents
export async function getDocuments() {
  const res = await apiFetch(`${BASE}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function getDocument(id) {
  const res = await apiFetch(`${BASE}/documents/${id}`);
  if (!res.ok) throw new Error('Failed to fetch document');
  return res.json();
}

export async function uploadDocument(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await apiFetch(`${BASE}/documents/upload`, { method: 'POST', body: form });
  if (!res.ok) {
    let msg = 'Failed to process document. Please try again.';
    try { const body = await res.json(); msg = body.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function deleteDocument(id) {
  const res = await apiFetch(`${BASE}/documents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Delete failed');
  return res.json();
}

export async function getMessages(documentId) {
  const res = await apiFetch(`${BASE}/documents/${documentId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

// Returns a raw Response for SSE streaming
export function sendChatMessage(documentId, message) {
  return fetch(`${BASE}/documents/${documentId}/chat`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

export async function generateSummary(documentId, force = false) {
  const url = `${BASE}/documents/${documentId}/summary${force ? '?force=true' : ''}`;
  const res = await apiFetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate summary');
  return res.json();
}

export async function extractTerms(documentId, force = false) {
  const url = `${BASE}/documents/${documentId}/terms${force ? '?force=true' : ''}`;
  const res = await apiFetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to extract key terms');
  return res.json();
}

export async function extractDeadlines(documentId, force = false) {
  const url = `${BASE}/documents/${documentId}/deadlines${force ? '?force=true' : ''}`;
  const res = await apiFetch(url, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to extract deadlines');
  return res.json();
}

export async function triggerAnalysis(documentId) {
  await fetch(`${BASE}/documents/${documentId}/analyze`, {
    method: 'POST',
    credentials: 'include',
  });
}

export function exportDocument(documentId, format = 'pdf') {
  window.open(`${BASE}/documents/${documentId}/export?format=${format}`, '_blank');
}
