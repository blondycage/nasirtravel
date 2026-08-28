'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Plane,
  Bot,
  ChevronDown,
  Sparkles,
  MessageCircle,
  RotateCcw,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: {
    id: string;
    category: string;
    question: string;
  }[];
  handoff?: {
    type: 'whatsapp';
    label: string;
    url: string;
  } | null;
  ticketAvailable?: boolean;
  evidenceSufficient?: boolean;
  responseMode?: 'ai' | 'knowledge';
}

const SUGGESTED_QUESTIONS = [
  'Find me an Umrah package',
  'What documents do I need?',
  'Can you explain the booking steps?',
  'I need help with my trip',
];

const FOLLOW_UP_QUESTIONS = [
  'What should I do next?',
  'Can I talk to a person?',
  'What documents are needed?',
  'How do payments work?',
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1E40AF] to-[#1e3a8a] flex items-center justify-center flex-shrink-0">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="mb-1 text-[11px] font-medium text-gray-500">
          Checking Naasir Travel knowledge
        </div>
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

function MessageBubble({
  message,
  onCreateTicket,
}: {
  message: Message;
  onCreateTicket: (message: Message) => void;
}) {
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
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-[#F97316] to-[#ea6c0b] text-white rounded-br-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {!isUser && (
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            <Sparkles className="h-3 w-3 text-[#F97316]" />
            <span>
              {message.responseMode === 'knowledge' ? 'Knowledge fallback' : 'AI assistant'}
            </span>
          </div>
        )}
        <div className="space-y-0.5">{formatContent(message.content)}</div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2 border-t border-gray-100 pt-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
              Sources
            </p>
            <div className="mt-1 space-y-1">
              {message.sources.map(source => (
                <div key={source.id} className="text-[10px] text-gray-500">
                  {source.category}: {source.question}
                </div>
              ))}
            </div>
          </div>
        )}
        {!isUser && message.handoff && (
          <a
            href={message.handoff.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex rounded-full bg-green-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-green-700 transition-colors"
          >
            {message.handoff.label}
          </a>
        )}
        {!isUser && message.ticketAvailable && (
          <button
            type="button"
            onClick={() => onCreateTicket(message)}
            className="mt-2 ml-2 inline-flex rounded-full border border-[#1E40AF]/20 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1E40AF] hover:bg-[#1E40AF] hover:text-white transition-colors"
          >
            Create support request
          </button>
        )}
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-orange-100 text-right' : 'text-gray-400'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

export default function ChatWidget() {
  const initialMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content:
      "As-salamu alaykum. I'm Naasir, your travel assistant.\n\nTell me what you're planning, where you want to go, or what part of booking feels unclear. I can help with packages, documents, payments, Umrah and Hajj guidance, and getting you to the right staff member.",
    timestamp: new Date(),
  };
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ticketMessage, setTicketMessage] = useState<Message | null>(null);
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
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
        const isStructuredStream = res.headers
          .get('Content-Type')
          ?.includes('application/x-ndjson');
        let fullContent = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });

          if (!isStructuredStream) {
            fullContent += chunk;
            setMessages(prev =>
              prev.map(m =>
                m.id === assistantMsg.id ? { ...m, content: fullContent } : m
              )
            );
            continue;
          }

          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            const event = JSON.parse(line) as
              | { type: 'text'; text: string }
              | {
                  type: 'metadata';
                  sources?: Message['sources'];
                  handoff?: Message['handoff'];
                  ticketAvailable?: boolean;
                  evidence?: { sufficient?: boolean };
                  responseMode?: Message['responseMode'];
                }
              | { type: 'error'; message: string }
              | { type: 'done' };

            if (event.type === 'text') {
              fullContent += event.text;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsg.id ? { ...m, content: fullContent } : m
                )
              );
            }

            if (event.type === 'metadata') {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsg.id
                    ? {
                        ...m,
                        sources: event.sources || [],
                        handoff: event.handoff || null,
                        ticketAvailable: event.ticketAvailable,
                        evidenceSufficient: event.evidence?.sufficient,
                        responseMode: event.responseMode || 'ai',
                      }
                    : m
                )
              );
            }

            if (event.type === 'error') {
              fullContent += `\n\n${event.message}`;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsg.id ? { ...m, content: fullContent } : m
                )
              );
            }
          }
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

  const resetChat = () => {
    historyRef.current = [];
    setMessages([{ ...initialMessage, timestamp: new Date() }]);
    setShowSuggestions(true);
    setTicketMessage(null);
  };

  const openTicketForm = (message: Message) => {
    setTicketMessage(message);
    setTicketForm(prev => ({
      ...prev,
      message: message.content.slice(0, 900),
    }));
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage || isSubmittingTicket) return;

    setIsSubmittingTicket(true);
    try {
      const res = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ticketForm.name,
          email: ticketForm.email,
          phone: ticketForm.phone,
          subject: 'Chatbot support request',
          message: ticketForm.message,
          lastUserMessage: historyRef.current.filter(m => m.role === 'user').at(-1)?.content || '',
          matchedEntryIds: ticketMessage.sources?.map(source => source.id) || [],
          evidenceSufficient: ticketMessage.evidenceSufficient,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Unable to create support request.');
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ticket-${Date.now()}`,
          role: 'assistant',
          content: `Your support request was created. Ticket ID: ${data.ticketId}`,
          timestamp: new Date(),
        },
      ]);
      setTicketMessage(null);
      setTicketForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: `ticket-error-${Date.now()}`,
          role: 'assistant',
          content:
            error instanceof Error
              ? error.message
              : 'Unable to create support request right now.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSubmittingTicket(false);
    }
  };

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
                <p className="text-blue-200 text-[11px]">Travel assistant • Naasir knowledge</p>
              </div>
              <button
                onClick={resetChat}
                className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                aria-label="Clear chat"
                type="button"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                aria-label="Close chat"
                type="button"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 bg-gray-50 scroll-smooth">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} onCreateTicket={openTicketForm} />
              ))}
              {isTyping && <TypingIndicator />}

              {!isTyping && messages.length > 1 && !showSuggestions && (
                <div className="mb-4 ml-9 flex flex-wrap gap-2">
                  {FOLLOW_UP_QUESTIONS.map(question => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => sendMessage(question)}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-600 shadow-sm transition-colors hover:border-[#1E40AF]/30 hover:text-[#1E40AF]"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

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

            {ticketMessage && (
              <form
                onSubmit={submitTicket}
                className="border-t border-gray-100 bg-white px-3 py-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-700">Create support request</p>
                  <button
                    type="button"
                    onClick={() => setTicketMessage(null)}
                    className="text-xs text-gray-400 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={ticketForm.name}
                    onChange={e => setTicketForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Name"
                    required
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-[#1E40AF] focus:outline-none"
                  />
                  <input
                    value={ticketForm.email}
                    onChange={e => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    type="email"
                    required
                    className="rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-[#1E40AF] focus:outline-none"
                  />
                </div>
                <input
                  value={ticketForm.phone}
                  onChange={e => setTicketForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone or WhatsApp (optional)"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-[#1E40AF] focus:outline-none"
                />
                <textarea
                  value={ticketForm.message}
                  onChange={e => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Briefly describe what you need help with"
                  required
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-[#1E40AF] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmittingTicket}
                  className="w-full rounded-lg bg-[#1E40AF] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {isSubmittingTicket ? 'Creating...' : 'Submit support request'}
                </button>
              </form>
            )}

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
                placeholder="Ask about packages, booking, Umrah..."
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
