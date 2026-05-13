import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, onTyping }) => {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim());
      setText('');
      onTyping(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 bg-white dark:bg-zinc-900">
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder="Type here..."
        className="flex-1 px-0 py-3 bg-transparent border-none focus:ring-0 outline-none transition-all text-slate-800 dark:text-zinc-200 placeholder:text-slate-300 dark:placeholder:text-zinc-700"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="p-2 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-all disabled:opacity-0"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
};

export default MessageInput;
