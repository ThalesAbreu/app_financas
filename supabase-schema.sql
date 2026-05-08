-- =============================================
-- FinançasPRO - Schema do Banco de Dados
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- Tabela de transações
CREATE TABLE IF NOT EXISTS public.transactions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  amount      numeric(12, 2) NOT NULL CHECK (amount > 0),
  date        date NOT NULL,
  type        text NOT NULL CHECK (type IN ('receita', 'despesa')),
  category    text NOT NULL CHECK (
    category IN (
      'Alimentação', 'Transporte', 'Moradia', 'Lazer',
      'Saúde', 'Educação', 'Investimentos', 'Salário', 'Freelance',
      'Dividendos', 'Saldo Anterior', 'Outros'
    )
  ),
  created_at  timestamptz DEFAULT now() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON public.transactions (date DESC);
CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON public.transactions (user_id, date DESC);

-- Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: cada usuário acessa apenas suas próprias transações
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Orçamento (regra 50/30/20)
-- =============================================
CREATE TABLE IF NOT EXISTS public.budget_settings (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month         integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year          integer NOT NULL,
  income        numeric(12, 2) NOT NULL CHECK (income > 0),
  needs_pct     numeric(5, 2) NOT NULL DEFAULT 50,
  leisure_pct   numeric(5, 2) NOT NULL DEFAULT 30,
  investment_pct numeric(5, 2) NOT NULL DEFAULT 20,
  UNIQUE(user_id, month, year)
);
ALTER TABLE public.budget_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budget_settings" ON public.budget_settings
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Metas financeiras
-- =============================================
CREATE TABLE IF NOT EXISTS public.goals (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name           text NOT NULL,
  target_amount  numeric(12, 2) NOT NULL CHECK (target_amount > 0),
  current_amount numeric(12, 2) NOT NULL DEFAULT 0,
  deadline       date,
  created_at     timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own goals" ON public.goals
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Dinheiro a receber (não soma no saldo)
-- =============================================
CREATE TABLE IF NOT EXISTS public.expected_income (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description   text NOT NULL,
  amount        numeric(12, 2) NOT NULL CHECK (amount > 0),
  expected_date date NOT NULL,
  received      boolean NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.expected_income ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own expected_income" ON public.expected_income
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Custos fixos recorrentes
-- =============================================
CREATE TABLE IF NOT EXISTS public.fixed_costs (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       text NOT NULL,
  amount     numeric(12, 2) NOT NULL CHECK (amount > 0),
  category   text NOT NULL,
  due_day    integer NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.fixed_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own fixed_costs" ON public.fixed_costs
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Registro de pagamentos mensais dos custos fixos
CREATE TABLE IF NOT EXISTS public.fixed_cost_payments (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fixed_cost_id uuid REFERENCES public.fixed_costs(id) ON DELETE CASCADE NOT NULL,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month         integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year          integer NOT NULL,
  paid_at       timestamptz DEFAULT now() NOT NULL,
  UNIQUE(fixed_cost_id, month, year)
);
ALTER TABLE public.fixed_cost_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own fixed_cost_payments" ON public.fixed_cost_payments
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
