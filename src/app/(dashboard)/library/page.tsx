"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Search,
  Filter,
  Trash2,
  Bot,
  Lightbulb,
  FileText,
  Calculator,
  Megaphone,
  TrendingUp,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface SavedResource {
  id: string;
  resource_type: string;
  resource_id: string;
  title: string;
  summary?: string;
  created_at: string;
}

const TYPE_ICONS: Record<string, any> = {
  conversation: Bot,
  idea: Lightbulb,
  plan: FileText,
  marketing: Megaphone,
  financial: Calculator,
  growth: TrendingUp,
  research: Search,
};

const TYPE_LINKS: Record<string, string> = {
  conversation: "/advisor",
  idea: "/ideas",
  plan: "/plans",
  marketing: "/marketing",
  financial: "/financial",
  growth: "/growth",
  research: "/research",
};

export default function LibraryPage() {
  const [resources, setResources] = useState<SavedResource[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortOrder, setSortOrder] = useState("date_desc");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchResources();
  }, [selectedType, sortOrder]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== "all") params.append("type", selectedType);
      if (sortOrder) params.append("sort", sortOrder);
      if (search) params.append("q", search);

      const res = await fetch(`/api/library?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error("Fetch library error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this resource from your library?")) return;
    try {
      const res = await fetch(`/api/library/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Delete resource error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Bookmark className="w-5 h-5 text-brand-600" />
          <h1 className="text-xl font-bold text-slate-900">Business Knowledge Library</h1>
        </div>
        <p className="text-xs text-slate-500">
          Your private repository of saved advice, validated ideas, generated business plans, financial models, and research notes.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search across all saved advice, plans, ideas, and calculations..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Type filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: "all", label: "All Items" },
              { key: "conversation", label: "Saved Advice" },
              { key: "idea", label: "Ideas" },
              { key: "plan", label: "Plans" },
              { key: "marketing", label: "Marketing" },
              { key: "financial", label: "Financial Calcs" },
              { key: "research", label: "Research Notes" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setSelectedType(t.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  selectedType === t.key
                    ? "bg-brand-500 text-white border-brand-500 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 focus:outline-none"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="title_asc">Title A-Z</option>
              <option value="title_desc">Title Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="space-y-3">
        {resources.length > 0 ? (
          resources.map((item) => {
            const Icon = TYPE_ICONS[item.resource_type] || Bookmark;
            const targetLink = TYPE_LINKS[item.resource_type] || "/dashboard";

            return (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {item.title}
                      </span>
                      <Badge variant="default" className="capitalize text-[10px]">
                        {item.resource_type}
                      </Badge>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    {item.summary && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    href={targetLink}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-600 hover:bg-brand-50 border border-brand-200 transition-colors"
                  >
                    <span>View in Tool</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition-colors"
                    title="Remove from library"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No Resources Saved</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Save AI advice responses, generated business ideas, marketing campaigns, or financial calculations to access them here anytime.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
