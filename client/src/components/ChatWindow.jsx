import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import MessageBubble from './MessageBubble.jsx';

function ThinkingDots() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, streaming, thinking, onSend }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const bottomRef = useRef(null);
  const isAtBottom = useRef(true);

  // Track whether user has manually scrolled up
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  }, []);

  // Auto-scroll only when user is at the bottom
  useEffect(() => {
    if (isAtBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, thinking]);

  // Auto-grow textarea up to 4 rows
  function growTextarea() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px'; // 4 rows ≈ 96px
  }

  function handleChange(e) {
    setInput(e.target.value);
    growTextarea();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    if (!input.trim() || streaming) return;
    onSend(input.trim());
    setInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    // User sent a message — snap back to bottom
    isAtBottom.current = true;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message list */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 bg-gray-50"
      >
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full text-center select-none">
            <p className="text-gray-400 text-sm">Ask anything about this document</p>
            <p className="text-gray-300 text-xs mt-1">Press Enter to send · Shift+Enter for a new line</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {thinking && <ThinkingDots />}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 bg-white border-t border-gray-200 flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about this document..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#2E75B6] resize-none overflow-hidden leading-6"
        />
        <button
          onClick={submit}
          disabled={!input.trim() || streaming}
          className="shrink-0 bg-[#2E75B6] text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Send"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
