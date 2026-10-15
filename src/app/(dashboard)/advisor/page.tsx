"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  Plus,
  Send,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  Trash2,
  Edit2,
  Sparkles,
  AlertCircle,
  MessageSquare,
  HelpCircle,
  X,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  is_saved?: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
  _count?: { messages: number };
}

const SAMPLE_PROMPTS = [
  "What profitable business can I start in the Philippines with ₱10,000 to ₱20,000?",
  "How should I calculate my product pricing markup and gross profit margin?",
  "How can I compete with established businesses in my neighborhood?",
  "What should I prioritize during the first 90 days of launching my business?",
  "What low-cost digital marketing strategies work best on TikTok and Facebook for small stores?",
];

// Error boundary to prevent white-screen crashes on mobile WebViews
class AdvisorErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("AdvisorErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center bg-white rounded-2xl border border-slate-200 m-3">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Unable to load AI Advisor</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            An unexpected error occurred while initializing the chat workspace.
          </p>
          <Button
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="primary"
            size="sm"
            className="mt-4"
          >
            Retry Loading
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdvisorChatContent() {
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("c");
  const initialPrompt = searchParams.get("prompt");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(initialConvId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState(false);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mobile history drawer
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);

  // Rename modal
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle initial prompt from query params
  useEffect(() => {
    if (initialPrompt && !inputQuestion && messages.length === 0) {
      setInputQuestion(initialPrompt);
    }
  }, [initialPrompt]);

  // Load active conversation messages when selected
  useEffect(() => {
    if (activeConversationId) {
      fetchConversationMessages(activeConversationId);
    } else {
      setMessages([]);
      setSuggestedFollowUps([]);
    }
  }, [activeConversationId]);

  // Internal container auto-scroll (NEVER scrolls the window)
  useEffect(() => {
    if (messages.length > 0 && chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length, isLoading]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/advisor/conversations");
      if (res.ok) {
        const data = await res.json();
        const convList = data.conversations || [];
        setConversations(convList);
        if (convList.length > 0 && !activeConversationId && !initialPrompt) {
          setActiveConversationId(convList[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const fetchConversationMessages = async (id: string) => {
    try {
      setError(null);
      const res = await fetch(`/api/advisor/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.conversation?.messages || []);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || inputQuestion;
    if (!question.trim() || isLoading) return;

    setError(null);
    setIsConfigError(false);
    setIsLoading(true);

    // Optimistic user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: question.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInputQuestion("");
    setSuggestedFollowUps([]);

    try {
      const customGeminiKey = typeof window !== "undefined" ? localStorage.getItem("bizadvisor_gemini_key") : null;
      const res = await fetch("/api/advisor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(customGeminiKey ? { "x-gemini-key": customGeminiKey } : {}),
        },
        body: JSON.stringify({
          question: question.trim(),
          conversationId: activeConversationId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate AI advisory response.");
        setIsConfigError(!!data.isConfigError);
        // Remove optimistic user message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        setInputQuestion(question);
        setIsLoading(false);
        return;
      }

      // Update active conversation ID if newly created
      if (!activeConversationId && data.conversationId) {
        setActiveConversationId(data.conversationId);
      }

      // Replace optimistic message with actual DB messages
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        data.userMessage,
        data.assistantMessage,
      ]);

      if (data.suggestedFollowUps) {
        setSuggestedFollowUps(data.suggestedFollowUps);
      }

      fetchConversations();
    } catch (err: any) {
      setError("An unexpected network error occurred while communicating with the AI service.");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      setInputQuestion(question);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setSuggestedFollowUps([]);
    setError(null);
    setInputQuestion("");
    setMobileHistoryOpen(false);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation session?")) return;

    try {
      const res = await fetch(`/api/advisor/conversations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          startNewChat();
        }
      }
    } catch (err) {
      console.error("Delete conversation failed:", err);
    }
  };

  const handleRenameConversation = async (id: string) => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(`/api/advisor/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim() } : c))
        );
        setEditingConvId(null);
      }
    } catch (err) {
      console.error("Rename failed:", err);
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSaveMessage = async (msgId: string) => {
    if (!activeConversationId) return;
    try {
      const res = await fetch(`/api/advisor/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msgId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, is_saved: data.message.is_saved } : m))
        );
      }
    } catch (err) {
      console.error("Failed to toggle save message:", err);
    }
  };

  const handleRegenerate = () => {
    if (messages.length === 0) return;
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full min-h-[calc(100dvh-7.5rem)] lg:min-h-0 lg:h-[calc(100vh-8.5rem)] md:rounded-2xl md:border md:border-slate-200 bg-white md:shadow-sm overflow-hidden">
      {/* ============================================================ */}
      {/* 1. DESKTOP CONVERSATION SIDEBAR                              */}
      {/* ============================================================ */}
      <div className="w-72 bg-slate-50 border-r border-slate-200 flex-col justify-between hidden md:flex flex-shrink-0">
        <div className="p-3 border-b border-slate-200">
          <Button
            onClick={startNewChat}
            variant="primary"
            size="sm"
            className="w-full flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Advisory Session</span>
          </Button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length > 0 ? (
            conversations.map((c) => {
              const isActive = activeConversationId === c.id;
              const isEditing = editingConvId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => !isEditing && setActiveConversationId(c.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? "bg-white text-slate-900 font-semibold shadow-xs border border-slate-200"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 group-hover:text-brand-500" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={newTitle}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameConversation(c.id);
                          if (e.key === "Escape") setEditingConvId(null);
                        }}
                        onBlur={() => handleRenameConversation(c.id)}
                        className="w-full px-1 py-0.5 text-xs bg-white border border-brand-400 rounded focus:outline-none"
                      />
                    ) : (
                      <span className="truncate">{c.title}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingConvId(c.id);
                          setNewTitle(c.title);
                        }}
                        className="p-1 hover:text-slate-900 text-slate-400 rounded"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteConversation(c.id, e)}
                        className="p-1 hover:text-red-600 text-slate-400 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              No conversations yet. Start asking questions!
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Advisory Mode</span>
          <span className="font-semibold text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Context Aware
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MOBILE CONVERSATION HISTORY DRAWER                        */}
      {/* ============================================================ */}
      {mobileHistoryOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileHistoryOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="h-14 flex items-center justify-between px-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-600" />
                  <span className="font-bold text-slate-900 text-sm">Advisory History</span>
                </div>
                <button
                  onClick={() => setMobileHistoryOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                  aria-label="Close history"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3">
                <Button
                  onClick={startNewChat}
                  variant="primary"
                  size="sm"
                  className="w-full flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Advisory Session</span>
                </Button>
              </div>

              <div className="overflow-y-auto max-h-[calc(100vh-140px)] px-3 space-y-1">
                {conversations.length > 0 ? (
                  conversations.map((c) => {
                    const isActive = activeConversationId === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setActiveConversationId(c.id);
                          setMobileHistoryOpen(false);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                          isActive
                            ? "bg-brand-50 text-brand-700 font-semibold border border-brand-200"
                            : "text-slate-700 hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-brand-600" : "text-slate-400"}`} />
                          <span className="truncate">{c.title}</span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteConversation(c.id, e)}
                          className="p-1 text-slate-400 hover:text-red-600 ml-1"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No sessions yet.
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              BizAdvisor AI • Context Aware
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MAIN CHAT WORKSPACE (100% Mobile & Desktop Responsive)    */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 bg-white h-full">
        {/* Chat Header */}
        <div className="h-13 sm:h-14 border-b border-slate-100 px-3.5 sm:px-6 flex items-center justify-between bg-white/95 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200 flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {activeConversationId
                    ? conversations.find((c) => c.id === activeConversationId)?.title || "AI Business Advisor"
                    : "New Advisory Session"}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-200">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                  Gemini 1.5 Flash
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Mobile History Button */}
            <button
              onClick={() => setMobileHistoryOpen(true)}
              className="md:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
              aria-label="View advisory history"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>History</span>
              {conversations.length > 0 && (
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded-full font-bold ml-0.5">
                  {conversations.length}
                </span>
              )}
            </button>

            {/* New Session Button */}
            <Button
              onClick={startNewChat}
              variant="outline"
              size="sm"
              className="px-2.5 sm:px-3 text-xs"
              title="Start a new chat session"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span className="hidden xs:inline">New</span>
            </Button>

            {/* Regenerate Button */}
            {messages.length > 0 && (
              <Button
                onClick={handleRegenerate}
                variant="outline"
                size="sm"
                title="Regenerate last answer"
                className="px-2.5 sm:px-3 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Regenerate</span>
              </Button>
            )}
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mx-3 sm:mx-6 mt-3 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start justify-between gap-3 flex-shrink-0">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">{isConfigError ? "API Key Configuration Required" : "Advisory Error"}</div>
                <div className="mt-0.5">{error}</div>
              </div>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="text-xs font-semibold text-red-700 underline hover:text-red-900 flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div
          ref={chatScrollRef}
          className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-6 space-y-4 sm:space-y-6"
        >
          {messages.length === 0 ? (
            /* Empty State: Recommended Prompts (Thumb-friendly & responsive) */
            <div className="py-4 sm:py-8 max-w-xl mx-auto text-center">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200 shadow-xs mx-auto mb-3">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 px-2 leading-snug">
                What business decision can BizAdvisor help you with today?
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-md mx-auto px-2">
                Ask about pricing formulas, unit economics, lean startup testing, marketing channels, or competitor differentiation.
              </p>

              <div className="mt-5 w-full text-left space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Sample Inquiries:
                </div>
                {SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-white hover:border-brand-400 active:scale-[0.99] text-slate-700 text-xs font-medium text-left transition-all hover:shadow-xs flex items-center justify-between group"
                  >
                    <span className="line-clamp-2 pr-2">{prompt}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Render Message History */
            messages.map((msg) => {
              const isAssistant = msg.role === "assistant";

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 sm:gap-3.5 ${isAssistant ? "items-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
                      <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-3.5 sm:p-5 max-w-[88%] sm:max-w-2xl text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? "bg-slate-50/90 border border-slate-200/80 text-slate-900"
                        : "bg-brand-500 text-white shadow-xs"
                    }`}
                  >
                    {/* Message Body */}
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Actions for Assistant Message */}
                    {isAssistant && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="text-[10px] sm:text-[11px]">Structured Advisory Output</span>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-slate-200/70 text-slate-600 transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleSaveMessage(msg.id)}
                            className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-slate-200/70 transition-colors ${
                              msg.is_saved ? "text-amber-600 font-semibold" : "text-slate-600"
                            }`}
                          >
                            <Bookmark className={`w-3 h-3 ${msg.is_saved ? "fill-current" : ""}`} />
                            <span>{msg.is_saved ? "Saved" : "Save Advice"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Assistant Loading State */}
          {isLoading && (
            <div className="flex gap-2.5 sm:gap-3.5 items-start">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center flex-shrink-0 animate-pulse mt-0.5">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="rounded-2xl p-3.5 bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                <span className="inline-block w-2 h-2 rounded-full bg-brand-500 animate-ping flex-shrink-0" />
                <span>BizAdvisor AI is formulating prioritized recommendations...</span>
              </div>
            </div>
          )}

          {/* Follow-up Question Chips */}
          {suggestedFollowUps.length > 0 && !isLoading && (
            <div className="pt-2 pl-9 sm:pl-11">
              <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                <span>Suggested Follow-Up Inquiries:</span>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {suggestedFollowUps.map((fu, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(fu)}
                    className="text-xs bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-800 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors text-left"
                  >
                    &ldquo;{fu}&rdquo; &rarr;
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-2.5 sm:p-4 border-t border-slate-200 bg-white sticky bottom-0 z-10 flex-shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-200 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-500 transition-all"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask BizAdvisor AI for advice, action steps..."
              className="flex-1 min-w-0 bg-transparent px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputQuestion.trim() || isLoading}
              className="rounded-lg shadow-xs px-3 flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 sm:mt-1.5 text-center line-clamp-1">
            BizAdvisor AI utilizes tailored context. Preliminary projections and costs are estimates.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  return (
    <AdvisorErrorBoundary>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading AI Advisor...</div>}>
        <AdvisorChatContent />
      </Suspense>
    </AdvisorErrorBoundary>
  );
}
