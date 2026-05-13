import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatBubbleProps {
  text: string;
  sender: 'Anonymous 1' | 'Anonymous 2';
  timestamp: number;
  isMe: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ text, sender, timestamp, isMe }) => {
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn('flex flex-col mb-4', isMe ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm text-sm md:text-base break-words',
          isMe
            ? 'bg-indigo-600 text-white rounded-tr-none'
            : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-tl-none'
        )}
      >
        <p>{text}</p>
        <div className={cn('text-[10px] mt-1 opacity-70 flex justify-end', isMe ? 'text-indigo-100' : 'text-slate-500 dark:text-zinc-400')}>
          {time}
        </div>
      </div>
      <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 mx-1">{sender}</span>
    </div>
  );
};

export default ChatBubble;
