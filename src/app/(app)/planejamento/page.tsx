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
        <TabsList className="grid grid-cols-4 w-full h-auto gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <TabsTrigger value="budget" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm py-2">
            <BarChart3 className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">Orçamento</span>
            <span className="sm:hidden">Orç.</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm py-2">
            <Target className="h-3.5 w-3.5 shrink-0" />
            <span>Metas</span>
          </TabsTrigger>
          <TabsTrigger value="expected" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm py-2">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">A Receber</span>
            <span className="sm:hidden">Rec.</span>
          </TabsTrigger>
          <TabsTrigger value="fixed" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm py-2">
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
