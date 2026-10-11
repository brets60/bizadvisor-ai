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

  // Rename modal
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/advisor/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (data.conversations.length > 0 && !activeConversationId && !initialPrompt) {
          setActiveConversationId(data.conversations[0].id);
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
      const res = await fetch("/api/advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="flex h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Conversation Sidebar */}
      <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col justify-between hidden md:flex">
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

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Chat Header */}
        <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                {activeConversationId
                  ? conversations.find((c) => c.id === activeConversationId)?.title || "AI Business Advisor"
                  : "New Advisory Session"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={startNewChat}
              variant="outline"
              size="sm"
              className="md:hidden"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
            {messages.length > 0 && (
              <Button
                onClick={handleRegenerate}
                variant="outline"
                size="sm"
                title="Regenerate last answer"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Regenerate</span>
              </Button>
            )}
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">{isConfigError ? "API Key Configuration Required" : "Advisory Error"}</div>
                <div className="mt-0.5">{error}</div>
              </div>
            </div>
            <button
              onClick={() => handleSendMessage()}
              className="text-xs font-semibold text-red-700 underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            /* Empty State: Recommended Prompts */
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200 shadow-sm mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                What business decision can BizAdvisor help you with today?
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Ask about pricing formulas, unit economics, lean startup testing, marketing channels, or competitor differentiation.
              </p>

              <div className="mt-6 w-full text-left space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Sample Inquiries:
                </div>
                {SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-brand-400 text-slate-700 text-xs font-medium text-left transition-all hover:shadow-xs flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <span className="text-slate-400 group-hover:text-brand-600 text-xs ml-2">&rarr;</span>
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
                  className={`flex gap-3.5 ${isAssistant ? "items-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`rounded-2xl p-4 sm:p-5 max-w-3xl text-sm leading-relaxed ${
                      isAssistant
                        ? "bg-slate-50/80 border border-slate-200/80 text-slate-900"
                        : "bg-brand-500 text-white shadow-sm"
                    }`}
                  >
                    {/* Message Body */}
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Actions for Assistant Message */}
                    {isAssistant && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                        <span className="text-[11px]">Structured Advisory Output</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200/70 text-slate-600 transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleSaveMessage(msg.id)}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200/70 transition-colors ${
                              msg.is_saved ? "text-amber-600 font-semibold" : "text-slate-600"
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${msg.is_saved ? "fill-current" : ""}`} />
                            <span>{msg.is_saved ? "Saved in Library" : "Save Advice"}</span>
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
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
                <span className="inline-block w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                <span>BizAdvisor AI is formulating prioritized recommendations based on your business context...</span>
              </div>
            </div>
          )}

          {/* Follow-up Question Chips */}
          {suggestedFollowUps.length > 0 && !isLoading && (
            <div className="pt-2 pl-11">
              <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                <span>Suggested Follow-Up Inquiries:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedFollowUps.map((fu, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(fu)}
                    className="text-xs bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-700 hover:text-brand-800 px-3 py-1.5 rounded-full transition-colors text-left"
                  >
                    &ldquo;{fu}&rdquo; &rarr;
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-500 transition-all"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Ask BizAdvisor AI for advice, action steps, or financial guidance..."
              className="flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputQuestion.trim() || isLoading}
              className="rounded-lg shadow-xs"
            >
              <Send className="w-4 h-4 mr-1" />
              <span>Send</span>
            </Button>
          </form>
          <div className="text-[11px] text-slate-400 mt-2 text-center">
            BizAdvisor AI utilizes tailored context. Preliminary projections and costs are estimates, not guaranteed outcomes.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading AI Advisor...</div>}>
      <AdvisorChatContent />
    </Suspense>
  );
}
