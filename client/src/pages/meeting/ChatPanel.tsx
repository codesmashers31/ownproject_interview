import { X, Send, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface ChatPanelProps {
  onClose: () => void;
}

interface Message {
  id: number;
  sender: string;
  message: string;
  time: string;
  isOwn?: boolean;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'Sarah Johnson', message: 'Hey everyone! Thanks for joining.', time: '10:32 AM' },
    { id: 2, sender: 'Mike Chen', message: 'Happy to be here!', time: '10:33 AM' },
    { id: 3, sender: 'Emily Davis', message: 'Can everyone see the screen?', time: '10:34 AM' },
    { id: 4, sender: 'You', message: 'Yes, looks good!', time: '10:35 AM', isOwn: true },
  ]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        sender: 'You',
        message: message.trim(),
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        isOwn: true,
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          isClosing ? 'animate-out fade-out' : 'animate-in fade-in'
        }`}
      />
      
      {/* Panel */}
      <div className={`fixed right-0 top-0 bottom-0 w-96 bg-[#202020] shadow-2xl z-50 border-l border-gray-700 flex flex-col transition-transform duration-300 ${
        isClosing ? 'animate-out slide-out-to-right' : 'animate-in slide-in-from-right'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-white">Messages</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#2a2a2a] rounded-full transition-all duration-200 hover:scale-105 active:scale-95">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#2a2a2a] rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                {!msg.isOwn && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                    <span className="text-white text-xs">{msg.sender.charAt(0)}</span>
                  </div>
                )}
                <span className="text-xs text-gray-400">{msg.sender}</span>
                <span className="text-xs text-gray-500">{msg.time}</span>
              </div>
              <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                msg.isOwn 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-[#2a2a2a] text-gray-200 rounded-tl-sm'
              }`}>
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Send a message to everyone"
              className="flex-1 px-4 py-2 bg-[#2a2a2a] text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}