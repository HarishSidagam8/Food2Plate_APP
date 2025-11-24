import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "How do I donate food?",
  "What foods can I donate?",
  "How does AI quality check work?",
  "Find food donations near me",
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Food2Plate Assistant. I can help you with food donations, quality analysis, eco tips, and platform guidance. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-4px);
        }
      }
      @keyframes expandIn {
        from {
          transform: scale(0.8);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const showErrorToast = (title: string, description: string) => {
    const toastElement = document.createElement('div');
    toastElement.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 99999; background: #ef4444; color: white; padding: 16px 20px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); max-width: 350px; animation: slideIn 0.3s ease-out;';
    toastElement.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px; font-size: 16px;">${title}</div>
      <div style="font-size: 14px; opacity: 0.95; line-height: 1.4;">${description}</div>
    `;
    
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => toastElement.remove(), 300);
    }, 4000);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickQuestions(false);

    try {
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke('clever-api', {
        body: {
          message: userMessage.content,
          conversationHistory,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      showErrorToast('Error', 'Failed to get response. Please try again.');

      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 z-[9999] flex items-center justify-center group"
          style={{
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35), 0 0 0 0 rgba(16, 185, 129, 0.5)',
            animation: 'float 3s ease-in-out infinite'
          }}
          aria-label="Open chat"
        >
          <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform duration-300" />
          <span 
            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white"
            style={{ animation: 'pulse 2s ease-in-out infinite' }}
          />
        </button>
      )}

      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 w-[440px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-2rem)] rounded-3xl shadow-2xl z-[9999] flex flex-col overflow-hidden backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50"
          style={{ 
            animation: 'expandIn 0.3s ease-out',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 px-6 py-5 flex items-center justify-between flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg tracking-tight">Food2Plate AI</h3>
                <p className="text-xs text-green-50 flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 bg-green-200 rounded-full shadow-sm" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                  Always here to help
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="h-10 w-10 rounded-xl hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 relative z-10"
              aria-label="Close chat"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-950/50 dark:to-gray-900"
            style={{ minHeight: 0 }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                style={{ animation: 'slideUp 0.3s ease-out' }}
              >
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Sparkles className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  )}
                </div>

                <div className="flex flex-col max-w-[75%]">
                  <div
                    className={`rounded-2xl px-5 py-3.5 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-tr-md'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200/80 dark:border-gray-700/80 rounded-tl-md backdrop-blur-sm'
                    }`}
                    style={{
                      boxShadow: message.role === 'user' 
                        ? '0 4px 12px rgba(16, 185, 129, 0.25)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                  <span className={`text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-2 px-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {showQuickQuestions && messages.length === 1 && (
              <div className="space-y-2.5 pt-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center mb-3 uppercase tracking-wide">
                  Suggested Questions
                </p>
                {QUICK_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(question)}
                    disabled={isLoading}
                    className="w-full text-left text-sm px-4 py-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/30 dark:hover:to-emerald-950/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md font-medium text-gray-700 dark:text-gray-300"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex gap-3" style={{ animation: 'slideUp 0.3s ease-out' }}>
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Sparkles className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl rounded-tl-md px-5 py-3.5 flex items-center gap-3 backdrop-blur-sm shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-6 py-5 flex-shrink-0">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 h-12 rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-green-400 dark:focus:border-green-500 focus:ring-2 focus:ring-green-400/20 dark:focus:ring-green-500/20 bg-white dark:bg-gray-800 px-5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm transition-all duration-200"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-800 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 flex-shrink-0 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Send className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-3 text-center">
              Powered by AI • Press Enter to send
            </p>
          </div>
        </div>
      )}
    </>
  );
}
