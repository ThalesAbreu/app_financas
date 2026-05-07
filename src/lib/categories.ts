import { Category, TransactionType } from "./types";

export const EXPENSE_CATEGORIES: Category[] = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Outros",
];

export const INCOME_CATEGORIES: Category[] = [
  "Salário",
  "Freelance",
  "Outros",
];

export const ALL_CATEGORIES: Category[] = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Salário",
  "Freelance",
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
  Salário: "#22c55e",
  Freelance: "#06b6d4",
  Outros: "#94a3b8",
};
