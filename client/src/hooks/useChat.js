import { useState, useEffect, useRef, useCallback } from 'react';
import { getMessages, sendChatMessage } from '../services/api.js';

export function useChat(documentId) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);

  // Batch SSE chunks — accumulate text between animation frames
  const pendingTextRef = useRef('');
  const rafRef = useRef(null);

  // Cancel any pending rAF flush
  function cancelFlush() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    pendingTextRef.current = '';
  }

  // Flush accumulated text into the last message in one state update
  function scheduleFlush() {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const text = pendingTextRef.current;
      pendingTextRef.current = '';
      rafRef.current = null;
      if (!text) return;
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = { ...last, content: last.content + text };
        return updated;
      });
    });
  }

  // Reset and reload messages when document changes
  useEffect(() => {
    if (!documentId) {
      setMessages([]);
      return;
    }
    setMessages([]);
    getMessages(documentId).then(setMessages).catch(console.error);
    return () => cancelFlush();
  }, [documentId]);

  const sendMessage = useCallback(async (text) => {
    cancelFlush();

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: '' },
    ]);
    setStreaming(true);

    try {
      const res = await sendChatMessage(documentId, text);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          const payload = line.slice(6);
          if (payload === '[DONE]') break;
          const { text: token } = JSON.parse(payload);
          pendingTextRef.current += token;
          scheduleFlush();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      // Flush any remaining text before marking done
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      const remaining = pendingTextRef.current;
      pendingTextRef.current = '';
      if (remaining) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          updated[updated.length - 1] = { ...last, content: last.content + remaining };
          return updated;
        });
      }
      setStreaming(false);
    }
  }, [documentId]);

  // thinking = streaming but the assistant reply hasn't arrived yet
  const thinking =
    streaming &&
    messages.length > 0 &&
    messages[messages.length - 1].role === 'assistant' &&
    !messages[messages.length - 1].content;

  return { messages, streaming, thinking, sendMessage };
}
