export interface BudgetState {
  budgetUsdc: number;
  spentUsdc: number;
  warned80: boolean;
}

export function createBudgetState(budgetUsdc: number): BudgetState {
  return { budgetUsdc, spentUsdc: 0, warned80: false };
}

/** Returns warning message once spend crosses 80% of budget (stub). */
export function checkBudget(
  state: BudgetState,
  nextCostUsdc: number,
): string | null {
  const projected = state.spentUsdc + nextCostUsdc;
  const ratio = projected / state.budgetUsdc;
  if (!state.warned80 && ratio >= 0.8 && ratio < 1) {
    state.warned80 = true;
    return `Budget warning: projected spend $${projected.toFixed(4)} is ≥80% of $${state.budgetUsdc.toFixed(2)} cap.`;
  }
  if (projected > state.budgetUsdc) {
    return `Budget exceeded: projected $${projected.toFixed(4)} > $${state.budgetUsdc.toFixed(2)}.`;
  }
  return null;
}

export function recordSpend(state: BudgetState, amountUsdc: number): void {
  state.spentUsdc += amountUsdc;
}
