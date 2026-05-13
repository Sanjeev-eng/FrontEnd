import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatBubbleProps {
  text: string;
  timestamp: number;
  isMe: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ text, timestamp, isMe }) => {
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={cn('flex flex-col mb-2', isMe ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[85%] px-4 py-2 rounded-xl text-sm md:text-base break-words',
          isMe
            ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
            : 'bg-white dark:bg-zinc-900 border border-transparent text-slate-900 dark:text-zinc-100'
        )}
      >
        <p>{text}</p>
        <div className={cn('text-[9px] mt-1 opacity-40 flex justify-end text-slate-500 dark:text-zinc-500')}>
          {time}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
