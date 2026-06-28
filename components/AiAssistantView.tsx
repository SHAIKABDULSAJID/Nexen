import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Post, User } from "../types";
import { CURRENT_USER } from "../constants";

interface AiAssistantViewProps {
  savedPosts: Post[];
  onBack: () => void;
}

interface Message {
  role: "user" | "model";
  content: string;
}

const STARTER_PROMPTS = [
  "How do I create my first post?",
  "How does Launchpad work?",
  "How can I update my profile?",
  "How do I use saved posts?",
];

const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  savedPosts,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          context: savedPosts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "model", content: data.response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendStarterPrompt = (prompt: string) => {
    if (isLoading) return;
    setInput(prompt);
    setTimeout(() => {
      void handleSend();
    }, 0);
  };

  return (
    <div className="md:col-span-12 lg:col-span-12 h-full flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Nexen AI
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
            <Bot className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-smooth pb-32"
      >
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-medium text-slate-900 dark:text-white tracking-tight">
                Hello, {CURRENT_USER.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                How can I help you today? I can analyze your saved posts,
                brainstorm ideas, or just chat.
              </p>
              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendStarterPrompt(prompt)}
                    className="text-left px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "model" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 border ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"
                }`}
              >
                <p
                  className={`text-[11px] font-bold uppercase tracking-wide mb-1 ${
                    msg.role === "user"
                      ? "text-blue-100"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {msg.role === "user" ? "You" : "Nexen Assistant"}
                </p>
                <div
                  className={`text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "text-white"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-4 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 mb-4 space-y-2">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-6 mb-4 space-y-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li>{children}</li>,
                      code: ({ children }) => (
                        <code className="bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded font-mono text-sm text-slate-800 dark:text-slate-100">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto mb-4">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0 mt-1">
                  <div className="w-2 h-2 bg-slate-500 rounded-full" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex gap-1 items-center py-2">
                <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 dark:to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto relative group pointer-events-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-[28px] opacity-0 group-focus-within:opacity-20 transition duration-500 blur" />
          <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-[26px] border border-slate-200 dark:border-white/10 shadow-2xl transition-all">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Nexen Assistant anything about using the app"
              className="w-full pl-6 pr-14 py-4 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-500 outline-none resize-none max-h-40"
              style={{ height: "auto" }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`absolute right-3 p-2 rounded-full transition-all ${input.trim() && !isLoading ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400"}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 flex items-center justify-center gap-6">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Nexen AI can provide inaccurate info, including about people, so
              double-check its responses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantView;
