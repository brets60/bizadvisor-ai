"use client";

import React, { useState } from "react";
import {
  Calculator,
  DollarSign,
  TrendingUp,
  PieChart as PieIcon,
  Sparkles,
  Save,
  Check,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  calculateStartupCosts,
  calculateProfitMargin,
  calculateBreakEven,
  calculateCashFlow,
  StartupCostResult,
  ProfitMarginResult,
  BreakEvenResult,
  CashFlowForecastResult,
} from "@/lib/calculators/financial-formulas";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export default function FinancialToolsPage() {
  const [activeTab, setActiveTab] = useState<"startup" | "margin" | "breakeven" | "cashflow">("startup");

  // 1. Startup Cost States
  const [equipment, setEquipment] = useState<number>(30000);
  const [inventory, setInventory] = useState<number>(25000);
  const [rent, setRent] = useState<number>(15000);
  const [registration, setRegistration] = useState<number>(5000);
  const [marketing, setMarketing] = useState<number>(10000);
  const [workingCapital, setWorkingCapital] = useState<number>(15000);
  const [otherCosts, setOtherCosts] = useState<number>(5000);

  // 2. Profit Margin States
  const [sellingPrice, setSellingPrice] = useState<number>(250);
  const [cogs, setCogs] = useState<number>(120);
  const [additionalVariable, setAdditionalVariable] = useState<number>(20);

  // 3. Break-even States
  const [fixedCosts, setFixedCosts] = useState<number>(45000);
  const [bePricePerUnit, setBePricePerUnit] = useState<number>(350);
  const [beVariablePerUnit, setBeVariablePerUnit] = useState<number>(170);

  // 4. Cash Flow States
  const [startingCash, setStartingCash] = useState<number>(50000);
  const [cashMonths, setCashMonths] = useState([
    { month: "Month 1", projectedInflow: 35000, projectedOutflow: 45000 },
    { month: "Month 2", projectedInflow: 50000, projectedOutflow: 40000 },
    { month: "Month 3", projectedInflow: 65000, projectedOutflow: 42000 },
    { month: "Month 4", projectedInflow: 80000, projectedOutflow: 45000 },
    { month: "Month 5", projectedInflow: 95000, projectedOutflow: 48000 },
    { month: "Month 6", projectedInflow: 110000, projectedOutflow: 50000 },
  ]);

  // AI & Save States
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Deterministic calculations
  const startupResult: StartupCostResult = calculateStartupCosts({
    equipment,
    inventory,
    rentAndDeposits: rent,
    registrationAndSetup: registration,
    marketing,
    workingCapital,
    otherCosts,
  });

  const marginResult: ProfitMarginResult = calculateProfitMargin({
    sellingPrice,
    cogs,
    additionalVariableCosts: additionalVariable,
  });

  const breakEvenResult: BreakEvenResult = calculateBreakEven({
    fixedCosts,
    sellingPricePerUnit: bePricePerUnit,
    variableCostPerUnit: beVariablePerUnit,
  });

  const cashFlowResult: CashFlowForecastResult = calculateCashFlow(
    startingCash,
    cashMonths
  );

  const getCurrentInputsAndResults = () => {
    switch (activeTab) {
      case "startup":
        return {
          type: "startup_cost",
          inputs: { equipment, inventory, rent, registration, marketing, workingCapital, otherCosts },
          results: startupResult,
        };
      case "margin":
        return {
          type: "profit_margin",
          inputs: { sellingPrice, cogs, additionalVariable },
          results: marginResult,
        };
      case "breakeven":
        return {
          type: "break_even",
          inputs: { fixedCosts, bePricePerUnit, beVariablePerUnit },
          results: breakEvenResult,
        };
      case "cashflow":
        return {
          type: "cash_flow",
          inputs: { startingCash, cashMonths },
          results: cashFlowResult,
        };
    }
  };

  const handleExplain = async () => {
    setError(null);
    setIsExplaining(true);
    setExplanation(null);

    const { type, inputs, results } = getCurrentInputsAndResults();

    try {
      const res = await fetch("/api/financial/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calcType: type, inputs, results }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate financial explanation.");
        setIsExplaining(false);
        return;
      }

      setExplanation(data.explanation);
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSaveCalculation = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const { type, inputs, results } = getCurrentInputsAndResults();

    try {
      const res = await fetch("/api/financial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calculationType: type,
          title: `${type.replace("_", " ").toUpperCase()} (${new Date().toLocaleDateString()})`,
          inputs,
          results,
          aiExplanation: explanation || undefined,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error("Save calc error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-emerald-600" />
          <h1 className="text-xl font-bold text-slate-900">Deterministic Financial Planning Tools</h1>
        </div>
        <p className="text-xs text-slate-500">
          Rigorous mathematical formulas combined with contextual AI advisory interpretations. No fabricated statistics.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2">
        {[
          { key: "startup", label: "Startup Cost Budget", icon: DollarSign },
          { key: "margin", label: "Profit Margin & Markup", icon: PieIcon },
          { key: "breakeven", label: "Break-Even Volume", icon: TrendingUp },
          { key: "cashflow", label: "Cash Flow Planner", icon: Calculator },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key as any);
                setExplanation(null);
                setError(null);
              }}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
                isActive
                  ? "border-brand-500 text-brand-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Calculator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Inputs (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            Calculation Inputs
          </h2>

          {/* 1. STARTUP COST INPUTS */}
          {activeTab === "startup" && (
            <div className="space-y-3">
              {[
                { label: "Equipment & Tools (₱)", val: equipment, set: setEquipment },
                { label: "Initial Inventory (₱)", val: inventory, set: setInventory },
                { label: "Rent & Advance Deposits (₱)", val: rent, set: setRent },
                { label: "Permits, Licenses & Setup (₱)", val: registration, set: setRegistration },
                { label: "Initial Marketing & Launch (₱)", val: marketing, set: setMarketing },
                { label: "Working Capital Reserve (₱)", val: workingCapital, set: setWorkingCapital },
                { label: "Miscellaneous & Contingency (₱)", val: otherCosts, set: setOtherCosts },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-semibold text-slate-700">{field.label}</label>
                  <input
                    type="number"
                    min="0"
                    value={field.val}
                    onChange={(e) => field.set(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="mt-1 block w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 2. PROFIT MARGIN INPUTS */}
          {activeTab === "margin" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Selling Price per Unit (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Cost of Goods Sold (COGS) per Unit (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={cogs}
                  onChange={(e) => setCogs(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Packaging & Variable Shipping (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={additionalVariable}
                  onChange={(e) => setAdditionalVariable(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* 3. BREAK-EVEN INPUTS */}
          {activeTab === "breakeven" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Fixed Operating Costs / Month (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={fixedCosts}
                  onChange={(e) => setFixedCosts(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Rent, salaries, utilities, subscriptions"
                  className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Selling Price per Unit (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={bePricePerUnit}
                  onChange={(e) => setBePricePerUnit(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Variable Cost per Unit (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={beVariablePerUnit}
                  onChange={(e) => setBeVariablePerUnit(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Direct materials, packaging, transaction fees"
                  className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* 4. CASH FLOW INPUTS */}
          {activeTab === "cashflow" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Starting Cash Reserve (₱)</label>
                <input
                  type="number"
                  min="0"
                  value={startingCash}
                  onChange={(e) => setStartingCash(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {cashMonths.map((m, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs space-y-1.5">
                    <div className="font-bold text-slate-800">{m.month}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500">Inflows (₱):</span>
                        <input
                          type="number"
                          value={m.projectedInflow}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCashMonths((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, projectedInflow: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500">Outflows (₱):</span>
                        <input
                          type="number"
                          value={m.projectedOutflow}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setCashMonths((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, projectedOutflow: val } : item))
                            );
                          }}
                          className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Button
              onClick={handleExplain}
              variant="primary"
              size="sm"
              isLoading={isExplaining}
              className="w-full"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span>Explain Results with AI</span>
            </Button>

            <Button
              onClick={handleSaveCalculation}
              variant="outline"
              size="sm"
              isLoading={isSaving}
              className="w-full"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  <span className="text-emerald-700">Saved to Library ✓</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  <span>Save Calculation</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Calculated Outputs & Visuals (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. STARTUP COST OUTPUTS */}
          {activeTab === "startup" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Total Startup Capital Required</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrency(startupResult.totalBudget)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Largest Allocation</div>
                  <Badge variant="info" className="mt-1 font-semibold">{startupResult.topCategory}</Badge>
                </div>
              </div>

              {/* Chart */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 mb-3">Capital Allocation Breakdown</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={startupResult.categories}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={40} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                      <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-100">
                    <tr>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-right">Amount</th>
                      <th className="p-2.5 text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {startupResult.categories.map((c, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-medium text-slate-800">{c.name}</td>
                        <td className="p-2.5 text-right font-bold text-slate-900">{formatCurrency(c.amount)}</td>
                        <td className="p-2.5 text-right text-slate-500">{c.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. PROFIT MARGIN OUTPUTS */}
          {activeTab === "margin" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Unit Cost</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{formatCurrency(marginResult.totalCost)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Gross Profit / Unit</div>
                  <div className={`text-base font-bold mt-1 ${marginResult.grossProfit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {formatCurrency(marginResult.grossProfit)}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-[11px] text-emerald-700 font-semibold uppercase">Profit Margin</div>
                  <div className="text-xl font-extrabold text-emerald-800 mt-1">{marginResult.profitMarginPercent}%</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-[11px] text-blue-700 font-semibold uppercase">Cost Markup</div>
                  <div className="text-xl font-extrabold text-blue-800 mt-1">{marginResult.markupPercent}%</div>
                </div>
              </div>

              {marginResult.warning && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{marginResult.warning}</span>
                </div>
              )}

              {/* Formula Explanation Callout */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-brand-600" />
                  <span>Formula Transparency:</span>
                </div>
                <div className="text-slate-600 font-mono text-[11px]">
                  Gross Profit = Selling Price ({formatCurrency(sellingPrice)}) - Total Unit Cost ({formatCurrency(marginResult.totalCost)}) = {formatCurrency(marginResult.grossProfit)}
                </div>
                <div className="text-slate-600 font-mono text-[11px]">
                  Profit Margin % = (Gross Profit / Selling Price) × 100 = ({marginResult.grossProfit} / {sellingPrice}) × 100 = {marginResult.profitMarginPercent}%
                </div>
                <div className="text-slate-600 font-mono text-[11px]">
                  Markup % = (Gross Profit / Total Cost) × 100 = ({marginResult.grossProfit} / {marginResult.totalCost}) × 100 = {marginResult.markupPercent}%
                </div>
              </div>
            </div>
          )}

          {/* 3. BREAK-EVEN OUTPUTS */}
          {activeTab === "breakeven" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Contribution Margin / Unit</div>
                  <div className="text-lg font-bold text-slate-900 mt-1">
                    {formatCurrency(breakEvenResult.contributionMarginPerUnit)} ({breakEvenResult.contributionMarginRatio}%)
                  </div>
                </div>
                <div className="p-3 bg-brand-50 rounded-xl border border-brand-100">
                  <div className="text-[11px] text-brand-700 font-semibold uppercase">Break-Even Units</div>
                  <div className="text-xl font-extrabold text-brand-800 mt-1">
                    {breakEvenResult.isAchievable ? `${breakEvenResult.breakEvenUnits.toLocaleString()} units` : "Impossible"}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-[11px] text-emerald-700 font-semibold uppercase">Break-Even Monthly Revenue</div>
                  <div className="text-xl font-extrabold text-emerald-800 mt-1">
                    {breakEvenResult.isAchievable ? formatCurrency(breakEvenResult.breakEvenRevenue) : "N/A"}
                  </div>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl text-xs ${breakEvenResult.isAchievable ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                <strong>Status:</strong> {breakEvenResult.statusMessage}
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800">Mathematical Formula:</div>
                <div className="font-mono text-[11px] text-slate-600">
                  Break-Even Units = Fixed Costs ({formatCurrency(fixedCosts)}) / (Price ({formatCurrency(bePricePerUnit)}) - Variable Cost ({formatCurrency(beVariablePerUnit)}))
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  Break-Even Units = {fixedCosts} / {breakEvenResult.contributionMarginPerUnit} = {breakEvenResult.breakEvenUnits} units
                </div>
              </div>
            </div>
          )}

          {/* 4. CASH FLOW OUTPUTS */}
          {activeTab === "cashflow" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-100 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Inflows</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{formatCurrency(cashFlowResult.totalInflows)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Outflows</div>
                  <div className="text-base font-bold text-slate-900 mt-1">{formatCurrency(cashFlowResult.totalOutflows)}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase">Net Cumulative</div>
                  <div className={`text-base font-bold mt-1 ${cashFlowResult.netCumulativeChange >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {formatCurrency(cashFlowResult.netCumulativeChange)}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-[11px] text-blue-700 font-semibold uppercase">Lowest Cash Point</div>
                  <div className="text-base font-extrabold text-blue-800 mt-1">
                    {formatCurrency(cashFlowResult.lowestCashBalance)}
                  </div>
                  <div className="text-[10px] text-blue-600 mt-0.5">({cashFlowResult.lowestCashMonth})</div>
                </div>
              </div>

              {/* Cash Balance Curve */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 mb-3">Projected Ending Cash Reserve Trajectory</h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cashFlowResult.monthlyProjections}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="endingBalance" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* AI Explanation Box */}
          {explanation && (
            <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-brand-300 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>BizAdvisor AI Financial Interpretation</span>
              </div>
              <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                {explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
