
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (text: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const [isSentAnimating, setIsSentAnimating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
      
      // Activar animación de feedback
      setIsSentAnimating(true);
      setTimeout(() => setIsSentAnimating(false), 700);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10 custom-scrollbar"
      >
        <div className="max-w-3xl mx-auto space-y-10">
          {messages.map((message, index) => (
            <div 
              key={message.id} 
              className={`
                flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}
                animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both
              `}
              style={{ animationDelay: `${index === messages.length - 1 ? '50ms' : '0ms'}` }}
            >
              <div className={`
                flex flex-col max-w-[95%] md:max-w-[85%] 
                ${message.role === 'user' ? 'items-end' : 'items-start'}
              `}>
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${message.role === 'user' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {message.role === 'user' ? 'Tú' : 'Camping AI'}
                  </span>
                </div>
                
                <div className={`
                  p-6 rounded-3xl shadow-sm text-[15px] leading-[1.6] whitespace-pre-wrap transition-all duration-300
                  ${message.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-200/50 hover:shadow-lg hover:shadow-emerald-200/60' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm hover:shadow-md'}
                `}>
                  {message.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-emerald-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Generando respuesta...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 md:p-10 bg-white border-t border-slate-100/60 backdrop-blur-md">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex items-center gap-4"
        >
          <div className="relative flex-1 group">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className={`
                w-full bg-slate-50 border rounded-2xl py-5 pl-7 pr-16 text-[15px] outline-none transition-all duration-500
                placeholder:text-slate-400 placeholder:transition-opacity
                ${isLoading ? 'opacity-60 cursor-not-allowed border-slate-100' : 'border-slate-200/60 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50'}
                ${isSentAnimating ? 'border-emerald-400 bg-emerald-50/30 scale-[0.995]' : 'bg-slate-50'}
              `}
            />
            {isLoading && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`
              bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-300 text-white p-5 rounded-2xl transition-all duration-300
              shadow-xl shadow-emerald-900/10 active:scale-90 flex items-center justify-center shrink-0 group overflow-hidden
              ${isSentAnimating ? 'ring-4 ring-emerald-500/20' : ''}
            `}
          >
            <svg 
              className={`
                transition-all duration-500 
                ${isSentAnimating ? 'translate-x-12 -translate-y-12 opacity-0' : 'translate-x-0 translate-y-0 opacity-100'}
                group-hover:translate-x-0.5 group-hover:-translate-y-0.5
              `}
              xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            
            {/* Pequeño destello de éxito al enviar */}
            {isSentAnimating && (
              <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            )}
          </button>
        </form>
        <div className="mt-5 text-center">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] animate-pulse">
            Atención al cliente inteligente • Càmping Paradís
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
