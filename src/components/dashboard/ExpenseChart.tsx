"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/categories";
import { useTheme } from "next-themes";

interface ExpenseChartProps {
  transactions: Transaction[];
  hidden?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ExpenseChart({ transactions, hidden = false }: ExpenseChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const expenses = transactions.filter((t) => t.type === "despesa");

  const totalDespesas = expenses.reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals = expenses.reduce(
    (acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const data = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
          Nenhuma despesa no período
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">
          Despesas por Categoria
        </CardTitle>
        <div className="text-right">
          <p className="text-xs text-gray-400 dark:text-gray-500">Total</p>
          <p className={`text-sm font-bold text-red-600 tabular-nums ${hidden ? "blur-sm select-none" : ""}`}>
            {hidden ? "R$ ••••••" : formatCurrency(totalDespesas)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`transition-all duration-200 ${hidden ? "blur-sm pointer-events-none select-none" : ""}`}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] ?? "#94a3b8"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), ""]}
                contentStyle={{
                  borderRadius: "8px",
                  border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  color: isDark ? "#f3f4f6" : "#111827",
                }}
              />
              <Legend
                iconType="circle"
                formatter={(value) => (
                  <span style={{ color: isDark ? "#d1d5db" : "#4b5563", fontSize: "12px" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
