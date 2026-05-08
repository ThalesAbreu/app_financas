"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BudgetTab } from "@/components/planning/BudgetTab";
import { GoalsTab } from "@/components/planning/GoalsTab";
import { ExpectedIncomeTab } from "@/components/planning/ExpectedIncomeTab";
import { FixedCostsTab } from "@/components/planning/FixedCostsTab";
import { Transaction, TransactionFilters } from "@/lib/types";
import { TransactionFiltersBar } from "@/components/transactions/TransactionFilters";
import { BarChart3, Target, Clock, Receipt } from "lucide-react";

export default function PlanejamentoPage() {
  const now = new Date();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    category: "todas",
    search: "",
  });

  const fetchTransactions = useCallback(async () => {
    const supabase = createClient();
    const startDate = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
    const endDate = new Date(filters.year, filters.month, 0).toISOString().split("T")[0];
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate);
    if (data) setTransactions(data as Transaction[]);
  }, [filters.month, filters.year]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Planejamento</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Orçamento, metas e controle financeiro</p>
      </div>

      <Tabs defaultValue="budget" className="space-y-6">
        <TabsList className="w-full h-auto p-1">
          <TabsTrigger value="budget" className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm h-auto">
            <BarChart3 className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Orçamento</span>
            <span className="sm:hidden">Orç.</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm h-auto">
            <Target className="h-3.5 w-3.5 shrink-0" />
            <span>Metas</span>
          </TabsTrigger>
          <TabsTrigger value="expected" className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm h-auto">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">A Receber</span>
            <span className="sm:hidden">Rec.</span>
          </TabsTrigger>
          <TabsTrigger value="fixed" className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm h-auto">
            <Receipt className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Custos Fixos</span>
            <span className="sm:hidden">Fixos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="space-y-4 mt-0">
          <TransactionFiltersBar filters={filters} onChange={setFilters} />
          <BudgetTab transactions={transactions} month={filters.month} year={filters.year} />
        </TabsContent>

        <TabsContent value="goals" className="mt-0">
          <GoalsTab />
        </TabsContent>

        <TabsContent value="expected" className="mt-0">
          <ExpectedIncomeTab />
        </TabsContent>

        <TabsContent value="fixed" className="mt-0">
          <FixedCostsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
