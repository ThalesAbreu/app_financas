import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Transaction } from "@/lib/types";

interface SummaryCardsProps {
  transactions: Transaction[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const totalReceitas = transactions
    .filter((t) => t.type === "receita")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = transactions
    .filter((t) => t.type === "despesa")
    .reduce((sum, t) => sum + t.amount, 0);

  const saldo = totalReceitas - totalDespesas;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Receitas</CardTitle>
          <div className="bg-green-100 p-2 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total do período</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Despesas</CardTitle>
          <div className="bg-red-100 p-2 rounded-lg">
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesas)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total do período</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Saldo</CardTitle>
          <div className={`p-2 rounded-lg ${saldo >= 0 ? "bg-blue-100 dark:bg-blue-900/30" : "bg-orange-100 dark:bg-orange-900/30"}`}>
            <Wallet className={`h-4 w-4 ${saldo >= 0 ? "text-blue-600" : "text-orange-600"}`} />
          </div>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${saldo >= 0 ? "text-blue-600" : "text-orange-600"}`}>
            {formatCurrency(saldo)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receitas - Despesas</p>
        </CardContent>
      </Card>
    </div>
  );
}
