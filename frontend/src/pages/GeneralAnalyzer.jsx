import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareCode,
  Send,
  Trash2,
  Copy,
  Check,
  Paperclip,
  X,
  Sparkles,
  Bot,
  User,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import ResultCard from '../components/ResultCard';
import { generalAPI } from '../services/api';

const INITIAL_MESSAGES = [
  {
    sender: 'assistant',
    text: 'Hello! I am your AI Analyzer Assistant. You can ask me technical questions, paste documents or code to dissect, brainstorm career strategies, or explore data concepts. How can I help you today?'
  }
];

export default function GeneralAnalyzer() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [contextText, setContextText] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { sender: 'user', text: input.trim() };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await generalAPI.chat({
        messages: currentMessages,
        message: userMsg.text,
        contextText: contextText.trim()
      });

      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          { sender: 'assistant', text: res.data.reply }
        ]);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to receive AI response.');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I encountered an error connecting to the AI model. Please verify your GEMINI_API_KEY in the backend .env file.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages(INITIAL_MESSAGES);
    setContextText('');
    setShowContextInput(false);
    toast.success('Conversation cleared');
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="pb-6 border-b border-[#E8ECF4] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              Module 06
            </span>
            <span className="text-xs text-[#7C879B] dark:text-slate-400">• Multimodal Conversational Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17243D] dark:text-white tracking-tight">
            General AI Analyzer
          </h1>
          <p className="text-sm text-[#7C879B] dark:text-slate-400 mt-1">
            Query, cross-examine, and consult with the Gemini AI model regarding any technical topic or document.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#E8ECF4] dark:border-slate-700 hover:border-rose-400 text-xs font-semibold text-[#7C879B] hover:text-rose-600 transition-colors shadow-xs"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Main Chat Interface Container */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-[#1E293B] border border-[#E8ECF4] dark:border-slate-800 shadow-card flex flex-col h-[650px] overflow-hidden">
        {/* Optional Document Context Drawer */}
        {showContextInput && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-[#E8ECF4] dark:border-slate-800 animate-in slide-in-from-top duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#17243D] dark:text-white flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-[#3867F5]" />
                Attached Document / Code Context
              </span>
              <button
                onClick={() => setShowContextInput(false)}
                className="text-[#7C879B] hover:text-[#17243D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={3}
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Paste relevant text or code context for the AI to reference throughout this session..."
              className="w-full p-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-[#17243D] dark:text-white focus:outline-none focus:border-[#3867F5] resize-none"
            />
          </div>
        )}

        {/* Message Bubble Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3.5 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#3867F5] text-white rounded-tr-xs shadow-sm font-medium'
                        : 'bg-slate-50 dark:bg-slate-900 border border-[#E8ECF4] dark:border-slate-800 text-[#17243D] dark:text-slate-200 rounded-tl-xs whitespace-pre-wrap shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-2 pl-1">
                      <button
                        onClick={() => handleCopy(msg.text, idx)}
                        className="text-[10px] text-[#7C879B] hover:text-[#3867F5] flex items-center gap-1 transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy response</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-[#7C879B] dark:text-slate-400">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-[#E8ECF4] dark:border-slate-800">
                <Loader2 className="w-4 h-4 text-[#3867F5] animate-spin" />
                <span>AI Analyzer is formulating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-[#E8ECF4] dark:border-slate-800 bg-white dark:bg-[#1E293B] flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => setShowContextInput(!showContextInput)}
            className={`p-2.5 rounded-xl border border-[#E8ECF4] dark:border-slate-700 transition-colors ${
              showContextInput || contextText
                ? 'bg-blue-50 text-[#3867F5] border-blue-300'
                : 'text-[#7C879B] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Attach document/code context"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or query here (e.g. explain microservices, review logic)..."
            className="flex-1 py-3 px-4 rounded-xl border border-[#E8ECF4] dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-[#17243D] dark:text-white focus:outline-none focus:border-[#3867F5] focus:ring-2 focus:ring-blue-500/20"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="py-3 px-5 rounded-xl bg-[#3867F5] hover:bg-[#2B52D9] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

