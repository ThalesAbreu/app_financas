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
