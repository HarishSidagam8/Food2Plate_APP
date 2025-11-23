import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      content: "Hi! I'm your Food2Plate Assistant. I can help you with food donations, quality analysis, eco tips, and platform guidance. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      // Prepare conversation history for context (last 10 messages)
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke('chatbot', {
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
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
        variant: 'destructive',
      });

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
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-110 transition-all duration-300 z-50 group"
        >
          <MessageCircle className="h-7 w-7 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[380px] h-[600px] shadow-2xl z-50 flex flex-col overflow-hidden border-2 border-green-200 dark:border-green-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Food2Plate AI</h3>
                <p className="text-xs text-green-100 flex items-center gap-1">
                  <span className="h-2 w-2 bg-green-300 rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 text-white rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" ref={scrollRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-br-sm'
                      : 'bg-muted/80 backdrop-blur-sm rounded-bl-sm border border-border'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-[10px] mt-1.5 ${
                      message.role === 'user'
                        ? 'text-green-100'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Quick Questions */}
            {showQuickQuestions && messages.length === 1 && (
              <div className="space-y-2 animate-in fade-in-50 duration-500">
                <p className="text-xs text-muted-foreground text-center mb-3">Quick questions to get started:</p>
                {QUICK_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(question)}
                    className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-300 transition-all duration-200"
                    disabled={isLoading}
                  >
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="bg-muted/80 backdrop-blur-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 border border-border">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t bg-background/50 backdrop-blur-sm px-4 py-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 rounded-full border-2 focus:border-green-400 dark:focus:border-green-600"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-full bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Powered by AI • Press Enter to send
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
