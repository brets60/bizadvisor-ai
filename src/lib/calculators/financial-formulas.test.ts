import { describe, it, expect } from "vitest";
import {
  calculateStartupCosts,
  calculateProfitMargin,
  calculateBreakEven,
  calculateCashFlow,
} from "./financial-formulas";

describe("Financial Formulas Engine", () => {
  describe("calculateStartupCosts", () => {
    it("should compute exact total budget and category proportions", () => {
      const result = calculateStartupCosts({
        equipment: 25000,
        inventory: 15000,
        rentAndDeposits: 20000,
        registrationAndSetup: 5000,
        marketing: 10000,
        workingCapital: 15000,
        otherCosts: 10000,
      });

      expect(result.totalBudget).toBe(100000);
      expect(result.topCategory).toBe("Equipment & Tools");

      const equipmentCat = result.categories.find((c) => c.name === "Equipment & Tools");
      expect(equipmentCat?.percentage).toBe(25);
    });

    it("should handle zero or negative inputs safely", () => {
      const result = calculateStartupCosts({
        equipment: 0,
        inventory: 0,
        rentAndDeposits: 0,
        registrationAndSetup: 0,
        marketing: 0,
        workingCapital: 0,
        otherCosts: 0,
      });

      expect(result.totalBudget).toBe(0);
      expect(result.topCategory).toBe("None");
    });
  });

  describe("calculateProfitMargin", () => {
    it("should calculate gross profit, margin %, and markup % correctly", () => {
      // Selling price 100, COGS 60, additional 10 -> totalCost 70, profit 30
      const result = calculateProfitMargin({
        sellingPrice: 100,
        cogs: 60,
        additionalVariableCosts: 10,
      });

      expect(result.totalCost).toBe(70);
      expect(result.grossProfit).toBe(30);
      expect(result.profitMarginPercent).toBe(30); // 30 / 100 * 100 = 30%
      expect(result.markupPercent).toBe(42.86); // 30 / 70 * 100 = 42.86%
      expect(result.isProfitable).toBe(true);
    });

    it("should handle zero selling price without NaN or crash", () => {
      const result = calculateProfitMargin({
        sellingPrice: 0,
        cogs: 50,
      });

      expect(result.profitMarginPercent).toBe(0);
      expect(result.isProfitable).toBe(false);
      expect(result.warning).toBeDefined();
    });

    it("should flag selling at a loss", () => {
      const result = calculateProfitMargin({
        sellingPrice: 80,
        cogs: 100,
      });

      expect(result.grossProfit).toBe(-20);
      expect(result.isProfitable).toBe(false);
      expect(result.warning).toContain("selling at a loss");
    });
  });

  describe("calculateBreakEven", () => {
    it("should calculate break-even units and revenue accurately", () => {
      // Fixed costs 50,000, price 500, variable 300 -> CM 200 -> 250 units -> 125,000 revenue
      const result = calculateBreakEven({
        fixedCosts: 50000,
        sellingPricePerUnit: 500,
        variableCostPerUnit: 300,
      });

      expect(result.contributionMarginPerUnit).toBe(200);
      expect(result.contributionMarginRatio).toBe(40);
      expect(result.breakEvenUnits).toBe(250);
      expect(result.breakEvenRevenue).toBe(125000);
      expect(result.isAchievable).toBe(true);
    });

    it("should gracefully flag when variable cost exceeds selling price", () => {
      const result = calculateBreakEven({
        fixedCosts: 50000,
        sellingPricePerUnit: 200,
        variableCostPerUnit: 250,
      });

      expect(result.isAchievable).toBe(false);
      expect(result.breakEvenUnits).toBe(Infinity);
      expect(result.statusMessage).toContain("impossible");
    });
  });

  describe("calculateCashFlow", () => {
    it("should trace monthly cash flow trajectory and identify minimum balance", () => {
      const months = [
        { month: "Jan", projectedInflow: 50000, projectedOutflow: 60000 }, // net -10,000 -> 90,000
        { month: "Feb", projectedInflow: 40000, projectedOutflow: 70000 }, // net -30,000 -> 60,000
        { month: "Mar", projectedInflow: 80000, projectedOutflow: 50000 }, // net +30,000 -> 90,000
      ];

      const result = calculateCashFlow(100000, months);

      expect(result.startingBalance).toBe(100000);
      expect(result.totalInflows).toBe(170000);
      expect(result.totalOutflows).toBe(180000);
      expect(result.netCumulativeChange).toBe(-10000);
      expect(result.lowestCashBalance).toBe(60000);
      expect(result.lowestCashMonth).toBe("Feb");
      expect(result.hasDeficit).toBe(false);
      expect(result.monthlyProjections[0].endingBalance).toBe(90000);
    });
  });
});
