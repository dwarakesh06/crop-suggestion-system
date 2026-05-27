import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Sprout, Bot, User, ChevronDown, Sparkles } from 'lucide-react';
import api from '../utils/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! 🌾 I'm **CropBot**, your agricultural assistant. I can help you with:\n\n• 🌱 **Crop information** — soil, climate, growing tips for 50 crops\n• 🧪 **Fertilizer advice** — NPK recommendations and remedies\n• 📊 **Yield estimates** — expected production per hectare\n• 💡 **Farming tips** — best practices for better harvests\n\nJust ask me about any crop or farming topic!",
      suggestions: ["Tell me about rice", "Fertilizer guide", "Farming tips", "List all crops"],
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Format markdown-like bold text
  const formatText = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderMessage = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.trim() === '') return <br key={i} />;
      if (line.startsWith('•')) {
        return <div key={i} className="flex gap-1.5 ml-1 my-0.5"><span className="text-nature-400 shrink-0">•</span><span>{formatText(line.slice(1).trim())}</span></div>;
      }
      if (line.startsWith('_') && line.endsWith('_')) {
        return <p key={i} className="italic text-slate-500 text-xs mt-2">{line.slice(1, -1)}</p>;
      }
      return <p key={i} className="my-0.5">{formatText(line)}</p>;
    });
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/chat', { message: messageText });
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.data.data.reply,
        suggestions: res.data.data.suggestions || [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment. 🔄",
        suggestions: [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 group transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Open CropBot chat"
        id="chatbot-toggle"
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-nature-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-nature-600/30 hover:shadow-nature-600/50 hover:scale-110 transition-all duration-300">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-2xl bg-nature-500/30 animate-ping" style={{ animationDuration: '2s' }} />
          {/* Unread badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md">
              {unreadCount}
            </div>
          )}
        </div>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
        id="chatbot-window"
      >
        <div className="w-[380px] h-[560px] max-h-[80vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-slate-700/60"
          style={{
            background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.95) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div className="relative flex items-center gap-3 px-5 py-4 border-b border-slate-800/80">
            <div className="absolute inset-0 bg-gradient-to-r from-nature-600/10 to-emerald-600/5" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-nature-500/20 to-emerald-500/10 border border-nature-500/30 flex items-center justify-center">
              <Sprout className="h-5 w-5 text-nature-400" />
            </div>
            <div className="relative flex-1">
              <h3 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                CropBot
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </h3>
              <p className="text-[11px] text-nature-400 font-medium">Agricultural AI Assistant</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="relative w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-400 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin" id="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
                {/* Avatar */}
                <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${
                  msg.sender === 'bot'
                    ? 'bg-nature-500/15 border border-nature-500/25'
                    : 'bg-indigo-500/15 border border-indigo-500/25'
                }`}>
                  {msg.sender === 'bot'
                    ? <Bot className="h-3.5 w-3.5 text-nature-400" />
                    : <User className="h-3.5 w-3.5 text-indigo-400" />
                  }
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    msg.sender === 'bot'
                      ? 'bg-slate-800/70 text-slate-300 rounded-tl-md border border-slate-700/40'
                      : 'bg-gradient-to-br from-nature-600 to-emerald-600 text-white rounded-tr-md shadow-md shadow-nature-600/15'
                  }`}>
                    {msg.sender === 'bot' ? renderMessage(msg.text) : msg.text}
                  </div>

                  {/* Suggestions */}
                  {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-full">
                      {msg.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-[11px] px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-nature-400 hover:bg-nature-500/15 hover:border-nature-500/30 hover:text-nature-300 transition-all duration-200 whitespace-nowrap"
                          disabled={isLoading}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <span className="text-[10px] text-slate-600 mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 animate-fade-in">
                <div className="shrink-0 w-7 h-7 rounded-lg bg-nature-500/15 border border-nature-500/25 flex items-center justify-center mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-nature-400" />
                </div>
                <div className="bg-slate-800/70 border border-slate-700/40 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-nature-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-nature-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-nature-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {messages.length > 3 && (
            <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2">
              <button
                onClick={scrollToBottom}
                className="w-7 h-7 rounded-full bg-slate-800/90 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg opacity-0 hover:opacity-100"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-2xl border border-slate-700/40 focus-within:border-nature-500/40 transition-colors px-3 py-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about any crop..."
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none py-2"
                disabled={isLoading}
                id="chatbot-input"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  input.trim() && !isLoading
                    ? 'bg-nature-600 text-white hover:bg-nature-500 shadow-md shadow-nature-600/20'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                }`}
                aria-label="Send message"
                id="chatbot-send"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-600 mt-2">
              CropBot • 50 Crops • Powered by ML
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
