export interface SubtaskResult {
  slug: string;
  endpoint: string;
  ok: boolean;
  httpStatus: number;
  summary: string;
  costUsdc: number;
  error?: string;
  bodyPreview?: string;
}

export interface QuoteResult {
  task: string;
  budgetUsdc: number;
  plan: import("./plan.js").TaskPlan;
  withinBudget: boolean;
}

export interface RunResult {
  task: string;
  budgetUsdc: number;
  subtaskResults: SubtaskResult[];
  totalUsdc: number;
  synthesis: string;
  budgetWarnings: string[];
}
