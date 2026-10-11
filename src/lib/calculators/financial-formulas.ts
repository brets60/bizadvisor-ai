/**
 * Deterministic Financial Formulas for BizAdvisor AI
 * Rigorous mathematical implementations with input sanitization and zero-division handling.
 */

export interface StartupCostInputs {
  equipment: number;
  inventory: number;
  rentAndDeposits: number;
  registrationAndSetup: number;
  marketing: number;
  workingCapital: number;
  otherCosts: number;
}

export interface StartupCostResult {
  totalBudget: number;
  categories: {
    name: string;
    amount: number;
    percentage: number;
  }[];
  topCategory: string;
}

export interface ProfitMarginInputs {
  sellingPrice: number;
  cogs: number;
  additionalVariableCosts?: number;
}

export interface ProfitMarginResult {
  sellingPrice: number;
  totalCost: number;
  grossProfit: number;
  profitMarginPercent: number; // (Gross Profit / Selling Price) * 100
  markupPercent: number;       // (Gross Profit / Total Cost) * 100
  isProfitable: boolean;
  warning?: string;
}

export interface BreakEvenInputs {
  fixedCosts: number;
  sellingPricePerUnit: number;
  variableCostPerUnit: number;
}

export interface BreakEvenResult {
  contributionMarginPerUnit: number;
  contributionMarginRatio: number; // as percentage
  breakEvenUnits: number;
  breakEvenRevenue: number;
  isAchievable: boolean;
  statusMessage: string;
}

export interface CashFlowMonthInput {
  month: string;
  projectedInflow: number;
  projectedOutflow: number;
}

export interface CashFlowMonthResult {
  month: string;
  inflow: number;
  outflow: number;
  netCashFlow: number;
  endingBalance: number;
}

export interface CashFlowForecastResult {
  startingBalance: number;
  monthlyProjections: CashFlowMonthResult[];
  lowestCashBalance: number;
  lowestCashMonth: string;
  totalInflows: number;
  totalOutflows: number;
  netCumulativeChange: number;
  hasDeficit: boolean;
}

/**
 * 1. Startup Cost Calculator
 */
export function calculateStartupCosts(inputs: StartupCostInputs): StartupCostResult {
  const equipment = Math.max(0, inputs.equipment || 0);
  const inventory = Math.max(0, inputs.inventory || 0);
  const rentAndDeposits = Math.max(0, inputs.rentAndDeposits || 0);
  const registrationAndSetup = Math.max(0, inputs.registrationAndSetup || 0);
  const marketing = Math.max(0, inputs.marketing || 0);
  const workingCapital = Math.max(0, inputs.workingCapital || 0);
  const otherCosts = Math.max(0, inputs.otherCosts || 0);

  const totalBudget = equipment + inventory + rentAndDeposits + registrationAndSetup + marketing + workingCapital + otherCosts;

  const rawCategories = [
    { name: "Equipment & Tools", amount: equipment },
    { name: "Initial Inventory", amount: inventory },
    { name: "Rent & Deposits", amount: rentAndDeposits },
    { name: "Permits & Registration", amount: registrationAndSetup },
    { name: "Initial Marketing", amount: marketing },
    { name: "Working Capital Reserve", amount: workingCapital },
    { name: "Miscellaneous & Contingency", amount: otherCosts },
  ];

  const categories = rawCategories.map((c) => ({
    name: c.name,
    amount: c.amount,
    percentage: totalBudget > 0 ? Number(((c.amount / totalBudget) * 100).toFixed(1)) : 0,
  }));

  const sorted = [...categories].sort((a, b) => b.amount - a.amount);
  const topCategory = sorted[0]?.amount > 0 ? sorted[0].name : "None";

  return {
    totalBudget: Number(totalBudget.toFixed(2)),
    categories,
    topCategory,
  };
}

/**
 * 2. Profit Margin Calculator
 */
export function calculateProfitMargin(inputs: ProfitMarginInputs): ProfitMarginResult {
  const sellingPrice = Math.max(0, inputs.sellingPrice || 0);
  const cogs = Math.max(0, inputs.cogs || 0);
  const additional = Math.max(0, inputs.additionalVariableCosts || 0);
  const totalCost = Number((cogs + additional).toFixed(2));
  const grossProfit = Number((sellingPrice - totalCost).toFixed(2));

  let profitMarginPercent = 0;
  let markupPercent = 0;
  let warning: string | undefined;

  if (sellingPrice <= 0) {
    warning = "Selling price must be greater than zero to compute profit margins.";
  } else {
    profitMarginPercent = Number(((grossProfit / sellingPrice) * 100).toFixed(2));
  }

  if (totalCost > 0) {
    markupPercent = Number(((grossProfit / totalCost) * 100).toFixed(2));
  } else if (sellingPrice > 0) {
    markupPercent = 100; // Zero unit cost
  }

  if (grossProfit < 0) {
    warning = `Warning: Unit is currently selling at a loss of ₱${Math.abs(grossProfit).toLocaleString()} per unit.`;
  }

  return {
    sellingPrice,
    totalCost,
    grossProfit,
    profitMarginPercent,
    markupPercent,
    isProfitable: grossProfit > 0,
    warning,
  };
}

/**
 * 3. Break-Even Calculator
 */
export function calculateBreakEven(inputs: BreakEvenInputs): BreakEvenResult {
  const fixedCosts = Math.max(0, inputs.fixedCosts || 0);
  const sellingPrice = Math.max(0, inputs.sellingPricePerUnit || 0);
  const variableCost = Math.max(0, inputs.variableCostPerUnit || 0);

  const contributionMarginPerUnit = Number((sellingPrice - variableCost).toFixed(2));

  if (sellingPrice <= 0) {
    return {
      contributionMarginPerUnit: 0,
      contributionMarginRatio: 0,
      breakEvenUnits: 0,
      breakEvenRevenue: 0,
      isAchievable: false,
      statusMessage: "Selling price per unit must be greater than zero.",
    };
  }

  const contributionMarginRatio = Number(((contributionMarginPerUnit / sellingPrice) * 100).toFixed(2));

  if (contributionMarginPerUnit <= 0) {
    return {
      contributionMarginPerUnit,
      contributionMarginRatio,
      breakEvenUnits: Infinity,
      breakEvenRevenue: Infinity,
      isAchievable: false,
      statusMessage: "Break-even is mathematically impossible: Variable cost per unit is equal to or exceeds selling price.",
    };
  }

  const breakEvenUnits = Math.ceil(fixedCosts / contributionMarginPerUnit);
  const breakEvenRevenue = Number((breakEvenUnits * sellingPrice).toFixed(2));

  return {
    contributionMarginPerUnit,
    contributionMarginRatio,
    breakEvenUnits,
    breakEvenRevenue,
    isAchievable: true,
    statusMessage: `You need to sell ${breakEvenUnits.toLocaleString()} units to cover all fixed operating costs.`,
  };
}

/**
 * 4. Cash Flow Planner
 */
export function calculateCashFlow(
  startingBalance: number,
  months: CashFlowMonthInput[]
): CashFlowForecastResult {
  let currentBalance = Math.max(0, startingBalance || 0);
  let totalInflows = 0;
  let totalOutflows = 0;
  let lowestCashBalance = currentBalance;
  let lowestCashMonth = "Starting";
  let hasDeficit = currentBalance < 0;

  const monthlyProjections: CashFlowMonthResult[] = [];

  for (const item of months) {
    const inflow = Math.max(0, item.projectedInflow || 0);
    const outflow = Math.max(0, item.projectedOutflow || 0);
    const netCashFlow = Number((inflow - outflow).toFixed(2));
    currentBalance = Number((currentBalance + netCashFlow).toFixed(2));

    totalInflows += inflow;
    totalOutflows += outflow;

    if (currentBalance < lowestCashBalance) {
      lowestCashBalance = currentBalance;
      lowestCashMonth = item.month;
    }

    if (currentBalance < 0) {
      hasDeficit = true;
    }

    monthlyProjections.push({
      month: item.month,
      inflow,
      outflow,
      netCashFlow,
      endingBalance: currentBalance,
    });
  }

  return {
    startingBalance: Number(startingBalance.toFixed(2)),
    monthlyProjections,
    lowestCashBalance,
    lowestCashMonth,
    totalInflows: Number(totalInflows.toFixed(2)),
    totalOutflows: Number(totalOutflows.toFixed(2)),
    netCumulativeChange: Number((totalInflows - totalOutflows).toFixed(2)),
    hasDeficit,
  };
}
