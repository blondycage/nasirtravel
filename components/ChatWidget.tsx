'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Plane,
  ChevronDown,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  'How do I book a tour?',
  'What Umrah packages do you offer?',
  'How do I add a dependant?',
  'What documents do I need for Umrah?',
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1E40AF] to-[#1e3a8a] flex items-center justify-center flex-shrink-0">
        <Plane className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-400"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  const formatContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold text (**text**)
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const formatted = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
      );
      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('✅') || line.trim().match(/^\d+\./)) {
        return (
          <div key={i} className="flex gap-1.5 my-0.5">
            <span className="mt-0.5 flex-shrink-0 text-[10px]">
              {line.trim().startsWith('✅') ? '' : '•'}
            </span>
            <span>{formatted}</span>
          </div>
        );
      }
      return (
        <p key={i} className={line === '' ? 'my-1' : ''}>
          {formatted}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1E40AF] to-[#1e3a8a] flex items-center justify-center flex-shrink-0 shadow-sm">
          <Plane className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-[#F97316] to-[#ea6c0b] text-white rounded-br-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        <div className="space-y-0.5">{formatContent(message.content)}</div>
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-orange-100 text-right' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "As-salamu alaykum! I'm Naasir, your travel assistant 🕌\n\nI can help you with booking steps, Hajj & Umrah packages, dependants, travel tips, and more. What can I help you with today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      setShowSuggestions(false);
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      const updatedHistory = [
        ...historyRef.current,
        { role: 'user', content: trimmed },
      ];

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, history: historyRef.current }),
        });

        if (!res.ok) throw new Error('API error');

        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };

        setIsTyping(false);
        setMessages(prev => [...prev, assistantMsg]);

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;

          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsg.id ? { ...m, content: fullContent } : m
            )
          );
        }

        historyRef.current = [
          ...updatedHistory,
          { role: 'assistant', content: fullContent },
        ].slice(-12);

        if (!isOpen) setUnreadCount(c => c + 1);
      } catch {
        setIsTyping(false);
        setMessages(prev => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content:
              "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or contact our team directly during office hours.",
            timestamp: new Date(),
          },
        ]);
      }
    },
    [isTyping, isOpen]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center group"
            style={{
              background: 'linear-gradient(135deg, #1E40AF 0%, #F97316 100%)',
            }}
            aria-label="Open chat"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#1E40AF]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[370px] max-w-[calc(100vw-24px)] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ height: '540px' }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1E40AF 50%, #1d4ed8 100%)',
              }}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1E40AF]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-white font-semibold text-sm">Naasir AI</h3>
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                </div>
                <p className="text-blue-200 text-[11px]">NaasirTravel Assistant • Online</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                aria-label="Close chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 bg-gray-50 scroll-smooth">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}

              {/* Suggested questions */}
              <AnimatePresence>
                {showSuggestions && messages.length <= 1 && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4"
                  >
                    <p className="text-[11px] text-gray-400 mb-2 text-center">
                      — Quick questions —
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_QUESTIONS.map(q => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="text-[11px] px-3 py-1.5 rounded-full bg-white border border-[#1E40AF]/20 text-[#1E40AF] hover:bg-[#1E40AF] hover:text-white transition-all duration-200 shadow-sm font-medium"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about tours, booking, Umrah…"
                disabled={isTyping}
                className="flex-1 text-sm px-4 py-2.5 rounded-full border border-gray-200 focus:border-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/10 bg-gray-50 disabled:opacity-60 transition-all placeholder:text-gray-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() && !isTyping
                    ? 'linear-gradient(135deg, #F97316, #ea6c0b)'
                    : '#e5e7eb',
                }}
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </form>

            {/* Footer branding */}
            <div className="bg-white px-4 py-1.5 border-t border-gray-50 flex-shrink-0">
              <p className="text-[10px] text-gray-300 text-center">
                Powered by NaasirTravel AI · Responses may not be 100% accurate
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close overlay on mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 sm:hidden bg-black/20"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
