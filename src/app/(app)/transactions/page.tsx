"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionFiltersBar } from "@/components/transactions/TransactionFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Transaction, TransactionFilters } from "@/lib/types";
import { Plus, Download, RefreshCw } from "lucide-react";
import { exportToCSV } from "@/lib/csv";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TransactionsPage() {
  const supabase = createClient();
  const now = new Date();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    category: "todas",
    search: "",
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const startDate = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
    const endDate = new Date(filters.year, filters.month, 0).toISOString().split("T")[0];

    let query = supabase
      .from("transactions")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (filters.category !== "todas") {
      query = query.eq("category", filters.category);
    }

    const { data, error } = await query;

    if (!error && data) {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
  }, [filters, supabase]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = transactions.filter((t) =>
    filters.search
      ? t.description.toLowerCase().includes(filters.search.toLowerCase())
      : true
  );

  const monthLabel = format(new Date(filters.year, filters.month - 1, 1), "MMMM_yyyy", {
    locale: ptBR,
  });

  function handleExportCSV() {
    exportToCSV(filteredTransactions, `transacoes_${monthLabel}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transações</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {filteredTransactions.length} transação(ões) encontrada(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchTransactions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={filteredTransactions.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova
          </Button>
        </div>
      </div>

      <TransactionFiltersBar filters={filters} onChange={setFilters} />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <TransactionList
              transactions={filteredTransactions}
              onRefresh={fetchTransactions}
            />
          )}
        </CardContent>
      </Card>

      <TransactionForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}
