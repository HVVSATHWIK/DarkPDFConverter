import React from 'react';
import type { Message } from '../hooks/usePdfSettings';

interface MessagesProps {
  messages: Message[];
}

const Messages: React.FC<MessagesProps> = ({ messages }) => {
  return (
    <div className="messages" aria-live="polite" role="region">
      {messages.map((m) => (
        <div 
          key={m.id}
          className={`message message--${m.type}`}
          role={m.type === 'error' ? 'alert' : 'status'}
        >
          {m.text}
        </div>
      ))}
    </div>
  );
};

export default Messages;