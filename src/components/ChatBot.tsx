// src/components/ChatBot.tsx

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  "Understanding food quality reports",
  "Tips for reducing food waste",
  "How to use the platform",
  "Sustainability advice",
  "Questions about donations",
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! 👋 I'm your Food2Plate Assistant. I can help you with:\n\n• Understanding food quality reports\n• Tips for reducing food waste\n• How to use the platform\n• Sustainability advice\n• Any questions about donations\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowQuickQuestions(false);
    setError(null);

    try {
      console.log("Sending message to chatbot function...");
      
      const { data, error: functionError } = await supabase.functions.invoke("chatbot", {
        body: { message: textToSend },
      });

      console.log("Response:", data);
      console.log("Error:", functionError);

      if (functionError) {
        throw new Error(functionError.message || "Failed to get response from chatbot");
      }

      if (!data || !data.reply) {
        throw new Error("Invalid response format from chatbot");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      let errorMessage = "I'm having trouble connecting. Please try again.";
      
      if (error.message?.includes("Failed to fetch")) {
        errorMessage = "🔌 Connection error. Please check your internet connection.";
        setError("Cannot connect to chatbot service. Please check if the Edge Function is deployed.");
      } else if (error.message?.includes("not found")) {
        errorMessage = "⚠️ Chatbot service not found. Please contact support.";
        setError("Edge Function 'chatbot' not found. Run: supabase functions deploy chatbot");
      } else if (error.message?.includes("API key")) {
        errorMessage = "🔑 Service configuration error. Please contact support.";
        setError("GROQ_API_KEY not set. Run: supabase secrets set GROQ_API_KEY=your_key");
      }
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "error",
        content: errorMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
          className={cn(
            "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg",
            "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800",
            "transition-all duration-300 hover:scale-110 z-50"
          )}
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white dark:bg-gray-950 rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Food2Plate Assistant</h3>
                <p className="text-green-100 text-xs">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="m-4 mb-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 break-words shadow-sm",
                      message.role === "user"
                        ? "bg-green-600 text-white dark:bg-green-700"
                        : message.role === "error"
                        ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800"
                        : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1.5",
                        message.role === "user"
                          ? "text-green-100"
                          : message.role === "error"
                          ? "text-red-500 dark:text-red-400"
                          : "text-gray-400 dark:text-gray-500"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Quick Questions */}
              {showQuickQuestions && messages.length === 1 && !isLoading && (
                <div className="space-y-2 mt-3">
                  {QUICK_QUESTIONS.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all text-sm text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 flex items-center gap-2 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-950">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
