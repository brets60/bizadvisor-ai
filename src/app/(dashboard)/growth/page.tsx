"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Archive,
  Filter,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "archived";
  success_metric: string;
  expected_resources?: string;
  risks?: string;
  target_date?: string;
  created_at: string;
}

export default function GrowthPlannerPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0,
  });

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // AI Generator Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [focusArea, setFocusArea] = useState("Increase Repeat Purchases & Customer Retention");
  const [currentBottleneck, setCurrentBottleneck] = useState("One-time buyers don't return within 30 days");
  const [targetGoal, setTargetGoal] = useState("Achieve 35% repeat purchase rate within 60 days");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Manual Task Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualCategory, setManualCategory] = useState("retention");
  const [manualPriority, setManualPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [manualSuccessMetric, setManualSuccessMetric] = useState("");
  const [manualTargetDate, setManualTargetDate] = useState("");
  const [isCreatingManual, setIsCreatingManual] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGrowthItems();
  }, []);

  const fetchGrowthItems = async () => {
    try {
      const res = await fetch("/api/growth");
      if (res.ok) {
        const data = await res.json();
        setActionItems(data.actionItems || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch growth items error:", err);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ActionItem["status"]) => {
    try {
      const res = await fetch(`/api/growth/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchGrowthItems();
      }
    } catch (err) {
      console.error("Update status failed:", err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this action item?")) return;
    try {
      const res = await fetch(`/api/growth/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchGrowthItems();
      }
    } catch (err) {
      console.error("Delete item failed:", err);
    }
  };

  const handleGenerateAiPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingAi(true);
    setError(null);

    try {
      const res = await fetch("/api/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_ai",
          focusArea,
          currentBottleneck,
          targetGoal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate growth milestones.");
        setIsGeneratingAi(false);
        return;
      }

      setShowAiModal(false);
      fetchGrowthItems();
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCreateManualItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingManual(true);
    setError(null);

    try {
      const res = await fetch("/api/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: manualTitle,
          description: manualDescription,
          category: manualCategory,
          priority: manualPriority,
          successMetric: manualSuccessMetric,
          targetDate: manualTargetDate || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create action item.");
        setIsCreatingManual(false);
        return;
      }

      setShowManualModal(false);
      setManualTitle("");
      setManualDescription("");
      setManualSuccessMetric("");
      fetchGrowthItems();
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setIsCreatingManual(false);
    }
  };

  const filteredItems = actionItems.filter((item) => {
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
            <h1 className="text-xl font-bold text-slate-900">Business Growth Planner</h1>
          </div>
          <p className="text-xs text-slate-500">
            Structure high-priority growth sprints with measurable success metrics and real progress tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowAiModal(true)}
            variant="primary"
            size="sm"
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            <span>Generate Growth Sprint</span>
          </Button>

          <Button
            onClick={() => setShowManualModal(true)}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real Progress Metrics Summary (strictly based on genuine DB records) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Total Tasks</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-600 uppercase">Completed</div>
          <div className="text-xl font-bold text-emerald-700 mt-1">{stats.completed}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
          <div className="text-[11px] font-semibold text-blue-600 uppercase">In Progress</div>
          <div className="text-xl font-bold text-blue-700 mt-1">{stats.inProgress}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
          <div className="text-[11px] font-semibold text-amber-600 uppercase">Pending</div>
          <div className="text-xl font-bold text-amber-700 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-emerald-700 uppercase">True Completion</div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{stats.completionRate}%</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Filters:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="retention">Retention</option>
            <option value="pricing">Pricing</option>
            <option value="operations">Operations</option>
            <option value="marketing">Marketing</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="text-slate-400 text-[11px]">
          Showing {filteredItems.length} of {actionItems.length} initiatives
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isDone = item.status === "completed";

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border bg-white shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone ? "border-emerald-200 bg-emerald-50/20 opacity-80" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() =>
                      handleUpdateStatus(item.id, isDone ? "pending" : "completed")
                    }
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isDone
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 hover:border-brand-500 bg-white"
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold ${isDone ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {item.title}
                      </span>
                      <Badge
                        variant={
                          item.priority === "urgent"
                            ? "danger"
                            : item.priority === "high"
                            ? "warning"
                            : "default"
                        }
                      >
                        {item.priority}
                      </Badge>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <span className="font-semibold text-brand-700">Metric: {item.success_metric}</span>
                      {item.target_date && <span>Target: {formatDate(item.target_date)}</span>}
                      {item.risks && <span className="text-amber-700">Risk: {item.risks}</span>}
                    </div>
                  </div>
                </div>

                {/* Status Switcher & Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdateStatus(item.id, e.target.value as any)}
                    className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No Action Items</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Generate a high-impact growth sprint using AI or add your own custom tasks above.
            </p>
          </div>
        )}
      </div>

      {/* AI Growth Sprint Generator Modal */}
      <Modal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        title="Generate AI Growth Sprint Milestones"
        description="BizAdvisor AI will analyze your focus area and generate 5 to 7 prioritized, measurable action items."
        maxWidth="lg"
      >
        <form onSubmit={handleGenerateAiPlan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Growth Focus Area</label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500"
            >
              <option value="Increase Repeat Purchases & Customer Retention">Increase Repeat Purchases & Customer Retention</option>
              <option value="Pricing Optimization & Margin Improvement">Pricing Optimization & Margin Improvement</option>
              <option value="Cost Reduction & Lean Operations">Cost Reduction & Lean Operations</option>
              <option value="Expand Product Offerings & Upsells">Expand Product Offerings & Upsells</option>
              <option value="Test New Sales Channels (TikTok Shop, B2B)">Test New Sales Channels (TikTok Shop, B2B)</option>
              <option value="Customer Service Excellence & Word-of-Mouth">Customer Service Excellence & Word-of-Mouth</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Current Friction or Bottleneck</label>
            <input
              type="text"
              required
              value={currentBottleneck}
              onChange={(e) => setCurrentBottleneck(e.target.value)}
              placeholder="e.g. Inconsistent follow-up after the first order"
              className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Target Measurable Goal</label>
            <input
              type="text"
              required
              value={targetGoal}
              onChange={(e) => setTargetGoal(e.target.value)}
              placeholder="e.g. Lift gross margin from 28% to 42% in 45 days"
              className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowAiModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isGeneratingAi}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Generate Milestones</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manual Task Modal */}
      <Modal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        title="Create Action Item"
        description="Add a specific operational milestone to your growth roadmap."
        maxWidth="md"
      >
        <form onSubmit={handleCreateManualItem} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Task Title</label>
            <input
              type="text"
              required
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g. Audit supplier packaging costs"
              className="mt-1 block w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Action Description</label>
            <textarea
              rows={2}
              required
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              placeholder="Concrete execution steps"
              className="mt-1 block w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Category</label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                className="mt-1 block w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500"
              >
                <option value="retention">Retention</option>
                <option value="pricing">Pricing</option>
                <option value="operations">Operations</option>
                <option value="marketing">Marketing</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Priority</label>
              <select
                value={manualPriority}
                onChange={(e) => setManualPriority(e.target.value as any)}
                className="mt-1 block w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Success Metric</label>
            <input
              type="text"
              required
              value={manualSuccessMetric}
              onChange={(e) => setManualSuccessMetric(e.target.value)}
              placeholder="e.g. 15% reduction in box unit cost"
              className="mt-1 block w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Target Date (Optional)</label>
            <input
              type="date"
              value={manualTargetDate}
              onChange={(e) => setManualTargetDate(e.target.value)}
              className="mt-1 block w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowManualModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreatingManual}
            >
              <span>Add Task</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
