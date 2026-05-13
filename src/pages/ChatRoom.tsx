import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import ChatBubble from '../components/ChatBubble';
import MessageInput from '../components/MessageInput';
import { ArrowLeft, Share2, ShieldCheck, User as UserIcon } from 'lucide-react';

interface Message {
  id: string;
  sender: 'Anonymous 1' | 'Anonymous 2';
  text: string;
  timestamp: number;
}

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [role, setRole] = useState<'Anonymous 1' | 'Anonymous 2' | null>(null);
  const [otherUserStatus, setOtherUserStatus] = useState<'online' | 'offline'>('offline');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('join-room', { roomId }, (response: { success: boolean; role?: 'Anonymous 1' | 'Anonymous 2'; message?: string }) => {
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

    socket.on('user-joined', () => {
      setOtherUserStatus('online');
    });

    socket.on('user-left', () => {
      setOtherUserStatus('offline');
      setIsOtherTyping(false);
    });

    socket.on('user-typing', ({ isTyping }: { isTyping: boolean }) => {
      setIsOtherTyping(isTyping);
    });

    return () => {
      socket.off('new-message');
      socket.off('user-joined');
      socket.off('user-left');
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

  const copyRoomCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      alert('Room code copied!');
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
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white dark:bg-zinc-900 shadow-2xl">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm md:text-base">Room: {roomId}</h2>
              <button onClick={copyRoomCode} className="p-1 text-indigo-500 hover:text-indigo-600">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${otherUserStatus === 'online' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
              <span className="text-[10px] md:text-xs text-slate-500">{otherUserStatus === 'online' ? 'Other person is here' : 'Waiting for someone to join...'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="text-xs font-medium">{role || 'Connecting...'}</span>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full">
              <UserIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-medium">Securely Connected</p>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
                Messages are not stored. They will vanish once you leave.
              </p>
            </div>
          </div>
        )}
        
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            text={msg.text}
            sender={msg.sender}
            timestamp={msg.timestamp}
            isMe={msg.sender === role}
          />
        ))}
        
        {isOtherTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500 animate-pulse ml-1">
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            Someone is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
};

export default ChatRoom;
