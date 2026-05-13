import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, Plus, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!socket) return;
    setLoading(true);
    socket.emit('create-room', ({ roomId }: { roomId: string }) => {
      navigate(`/room/${roomId}`);
    });
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId.toUpperCase()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-zinc-800">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
              <MessageSquare className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AnonChat</h1>
          <p className="mt-2 text-slate-500 dark:text-zinc-400">
            Secure, anonymous two-person chat rooms.
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleCreateRoom}
            disabled={!isConnected || loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-5 h-5" />
            Create Private Room
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200 dark:border-zinc-800"></span>
            </div>
            <div className="relative flex justify-center text-sm uppercase">
              <span className="bg-white dark:bg-zinc-900 px-2 text-slate-500 dark:text-zinc-400">Or join existing</span>
            </div>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Room Code (e.g. AB12CD)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all uppercase placeholder:normal-case"
              />
            </div>
            <button
              type="submit"
              disabled={!isConnected || !roomId.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-all disabled:opacity-50"
            >
              Join Room
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-zinc-500">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
          {isConnected ? 'Connected & Secure' : 'Connecting to server...'}
        </div>
      </div>
    </div>
  );
};

export default Home;
