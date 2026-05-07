import { Category, TransactionType } from "./types";

export const EXPENSE_CATEGORIES: Category[] = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Investimentos",
  "Outros",
];

export const INCOME_CATEGORIES: Category[] = [
  "Salário",
  "Freelance",
  "Dividendos",
  "Saldo Anterior",
  "Outros",
];

export const ALL_CATEGORIES: Category[] = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Investimentos",
  "Salário",
  "Freelance",
  "Dividendos",
  "Saldo Anterior",
  "Outros",
];

export function getCategoriesForType(type: TransactionType): Category[] {
  return type === "receita" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  Alimentação: "#f97316",
  Transporte: "#3b82f6",
  Moradia: "#8b5cf6",
  Lazer: "#ec4899",
  Saúde: "#10b981",
  Educação: "#f59e0b",
  Investimentos: "#0ea5e9",
  Salário: "#22c55e",
  Freelance: "#06b6d4",
  Dividendos: "#a855f7",
  "Saldo Anterior": "#64748b",
  Outros: "#94a3b8",
};
