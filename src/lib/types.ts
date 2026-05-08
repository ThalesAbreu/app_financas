export type TransactionType = "receita" | "despesa";

export type Category =
  | "Alimentação"
  | "Transporte"
  | "Moradia"
  | "Lazer"
  | "Saúde"
  | "Educação"
  | "Investimentos"
  | "Salário"
  | "Freelance"
  | "Dividendos"
  | "Saldo Anterior"
  | "Outros";

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: Category;
  created_at: string;
}

export interface TransactionFilters {
  month: number;
  year: number;
  category: Category | "todas";
  search: string;
}

export interface BudgetSettings {
  id: string;
  user_id: string;
  month: number;
  year: number;
  income: number;
  needs_pct: number;
  leisure_pct: number;
  investment_pct: number;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
}

export interface ExpectedIncome {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  expected_date: string;
  received: boolean;
  created_at: string;
}

export interface FixedCost {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  due_day: number;
  active: boolean;
  created_at: string;
}

export interface FixedCostPayment {
  id: string;
  fixed_cost_id: string;
  user_id: string;
  month: number;
  year: number;
  paid_at: string;
}
