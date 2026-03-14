import { memo } from 'react';

// Renders inline markdown: **bold** and `code`
function renderInline(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let key = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(
        <code key={key++} className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts.length === 0 ? text : parts;
}

// Renders block markdown: code fences, bullet lists, paragraphs
function renderMarkdown(text) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={key++} className="bg-gray-100 rounded-md p-3 my-2 overflow-x-auto text-xs font-mono text-gray-800 whitespace-pre-wrap">
          {codeLines.join('\n')}
        </pre>
      );
      i++;
      continue;
    }

    // Bullet list — collect consecutive items
    if (/^[-*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(<li key={key++}>{renderInline(lines[i].slice(2))}</li>);
        i++;
      }
      elements.push(
        <ul key={key++} className="list-disc list-inside my-1 space-y-0.5">
          {items}
        </ul>
      );
      continue;
    }

    // Skip blank lines (add a little vertical rhythm via paragraph spacing)
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="my-0.5">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

function formatTime(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const MessageBubble = memo(function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  // Skip rendering the empty assistant placeholder while thinking
  if (!isUser && !message.content) return null;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-[#2E75B6] to-[#1d5a8a] text-white rounded-br-sm shadow-md'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-md'
          }`}
        >
          {isUser ? message.content : renderMarkdown(message.content)}
        </div>
        {message.created_at && (
          <span className="text-xs text-gray-400 mt-1 px-1">
            {formatTime(message.created_at)}
          </span>
        )}
      </div>
    </div>
  );
});

export default MessageBubble;
