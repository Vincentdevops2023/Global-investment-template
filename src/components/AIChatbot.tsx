import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, ArrowRight, PhoneCall } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  createdAt: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'bot',
      text: 'Welcome to GLOBAL EXCHANGE AND TRADE INVESTMENTS! I am GlobalBot, your 24/7 AI investment guide. How can I assist you with your investments, deposits, or withdrawals today?',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: textToSend,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    try {
      // Send chat history and current message to Express backend
      const history = messages
        .filter(m => m.sender !== 'system')
        .slice(-10) // last 10 messages for context
        .map(m => ({ sender: m.sender, text: m.text }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history })
      });

      const data = await res.json();
      
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: 'reply_' + Math.random().toString(36).substr(2, 9),
        sender: 'bot',
        text: data.reply || 'Apologies, I encountered a temporary network issue. Please try again.',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (e) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: 'reply_error',
        sender: 'bot',
        text: 'I am running in offline backup mode. For deposit, type "deposit". For plans, type "plans". To withdraw, type "withdraw". Or click our WhatsApp link to talk directly with our administrative team!',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage(message);
    }
  };

  const handleQuickAction = (topic: string) => {
    sendMessage(topic);
  };

  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // check list bullets
      if (line.startsWith('• ') || line.startsWith('* ')) {
        return <div key={i} className="pl-3 py-0.5">• {line.substring(2)}</div>;
      }
      return <p key={i} className={line.trim() === '' ? 'h-2' : 'mb-1.5'}>{line}</p>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="support-chatbot-anchor">
      {/* Chat toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold px-4 py-3.5 rounded-full shadow-2xl hover:scale-105 transition-all glow-gold duration-300 border border-yellow-300/30"
          id="chat-toggle-btn"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm tracking-wide">24/7 AI Support</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="w-[360px] md:w-[400px] h-[540px] bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300"
          id="support-chat-window"
        >
          {/* Window Header */}
          <div className="bg-gradient-to-r from-[#0B132B] to-[#101010] p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                <Bot className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  CamBot AI
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </h4>
                <p className="text-[10px] text-gray-400">Guaranteed instant assistance</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-950/20">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`p-1.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  msg.sender === 'user' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-300'
                }`}>
                  {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-medium rounded-tr-none' 
                      : 'bg-gray-900 border border-gray-800 text-gray-200 rounded-tl-none'
                  }`}>
                    {formatMessageText(msg.text)}
                  </div>
                  <span className={`text-[9px] font-mono text-gray-500 block ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.createdAt}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="p-1.5 h-8 w-8 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl rounded-tl-none text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Support Actions */}
          <div className="px-4 py-2 border-t border-gray-900 bg-gray-950 flex flex-wrap gap-1.5 shrink-0">
            <button 
              onClick={() => handleQuickAction('How do I make a deposit?')}
              className="text-[10px] font-mono bg-gray-900 border border-gray-800 hover:border-amber-500/40 px-2.5 py-1 rounded-full text-gray-300 transition"
            >
              Deposit Help 💸
            </button>
            <button 
              onClick={() => handleQuickAction('What are the investment plans?')}
              className="text-[10px] font-mono bg-gray-900 border border-gray-800 hover:border-amber-500/40 px-2.5 py-1 rounded-full text-gray-300 transition"
            >
              Investment Plans 📈
            </button>
            <button 
              onClick={() => handleQuickAction('How to make a withdrawal?')}
              className="text-[10px] font-mono bg-gray-900 border border-gray-800 hover:border-amber-500/40 px-2.5 py-1 rounded-full text-gray-300 transition"
            >
              Withdraw Help 🪙
            </button>
            <button 
              onClick={() => handleQuickAction('How does the referral bonus work?')}
              className="text-[10px] font-mono bg-gray-900 border border-gray-800 hover:border-amber-500/40 px-2.5 py-1 rounded-full text-gray-300 transition"
            >
              Referral Program 👥
            </button>
          </div>

          {/* Input Form Footer */}
          <div className="p-3 border-t border-gray-800 bg-gray-950 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <button 
              onClick={() => sendMessage(message)}
              disabled={!message.trim()}
              className="p-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold rounded-xl transition hover:scale-105 disabled:opacity-50 disabled:scale-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Contact Admin & WhatsApp buttons */}
          <div className="bg-gradient-to-r from-emerald-950/20 to-teal-950/20 border-t border-emerald-900/30 p-2 text-[10px] flex items-center justify-between text-gray-400 px-4 shrink-0">
            <span>Need human support?</span>
            <a 
              href="https://wa.me/237670123456?text=Hello%20Global%20Exchange%20Support,%20I%20need%20assistance" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition font-mono"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              WhatsApp Live
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
