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
      'Saúde', 'Educação', 'Salário', 'Freelance', 'Outros'
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
