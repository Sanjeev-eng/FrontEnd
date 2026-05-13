import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import { ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('join-room', { roomId }, (response: { success: boolean; role?: string; message?: string }) => {
      if (response.success && response.role) {
        setRole(response.role);
        setError(null);
      } else {
        setError(response.message || 'Failed to join room');
      }
    });

    socket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user-typing', ({ isTyping }: { isTyping: boolean }) => {
      setIsOtherTyping(isTyping);
    });

    return () => {
      socket.off('new-message');
      socket.off('user-typing');
    };
  }, [socket, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOtherTyping]);

  const handleSendMessage = (text: string) => {
    if (socket && roomId) {
      socket.emit('send-message', { roomId, text });
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socket && roomId) {
      socket.emit('typing', { roomId, isTyping });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Oops!</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white dark:bg-zinc-900">
      {/* Minimal Header */}
      <header className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="p-1 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xs font-medium text-slate-300 dark:text-zinc-600 tracking-widest uppercase">Room {roomId}</h2>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            text={msg.text}
            timestamp={msg.timestamp}
            isMe={msg.sender === role}
          />
        ))}
        
        {isOtherTyping && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-300 dark:text-zinc-700 mt-2 ml-1">
            <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full animate-bounce"></span>
            <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1 h-1 bg-slate-300 dark:bg-zinc-700 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-zinc-900">
        <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
      </div>
    </div>
  );
};

export default ChatRoom;
