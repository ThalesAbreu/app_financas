"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BudgetSettings, Transaction } from "@/lib/types";
import { Loader2, Settings2, TrendingUp, TrendingDown, Wallet, CircleDashed } from "lucide-react";

interface BudgetTabProps {
  transactions: Transaction[];
  month: number;
  year: number;
}

const NEEDS_CATEGORIES = ["Alimentação", "Transporte", "Moradia", "Saúde", "Educação"];
const LEISURE_CATEGORIES = ["Lazer"];
const INVESTMENT_CATEGORIES = ["Investimentos"];
const OTHER_CATEGORIES = ["Outros"];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function ProgressBar({ spent, limit, color }: { spent: number; limit: number; color: string }) {
  const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const overBudget = spent > limit && limit > 0;
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>Gasto: {formatCurrency(spent)}</span>
        <span className={overBudget ? "text-red-500 font-semibold" : ""}>
          {overBudget ? `Excedido em ${formatCurrency(spent - limit)}` : `Restante: ${formatCurrency(limit - spent)}`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${overBudget ? "bg-red-500" : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BudgetTab({ transactions, month, year }: BudgetTabProps) {
  const [settings, setSettings] = useState<BudgetSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [income, setIncome] = useState("");
  const [needsPct, setNeedsPct] = useState("50");
  const [leisurePct, setLeisurePct] = useState("30");
  const [investmentPct, setInvestmentPct] = useState("20");

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("budget_settings")
      .select("*")
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    if (data) {
      setSettings(data as BudgetSettings);
      setIncome(data.income.toString());
      setNeedsPct(data.needs_pct.toString());
      setLeisurePct(data.leisure_pct.toString());
      setInvestmentPct(data.investment_pct.toString());
    } else {
      setSettings(null);
      setIncome("");
      setNeedsPct("50");
      setLeisurePct("30");
      setInvestmentPct("20");
    }
    setLoading(false);
  }, [month, year]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const total = parseFloat(needsPct) + parseFloat(leisurePct) + parseFloat(investmentPct);
  const pctValid = Math.abs(total - 100) < 0.01;

  async function handleSave() {
    if (!pctValid) { toast.error("As porcentagens devem somar 100%"); return; }
    const incomeVal = parseFloat(income.replace(",", "."));
    if (isNaN(incomeVal) || incomeVal <= 0) { toast.error("Informe uma renda válida"); return; }

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const payload = {
      user_id: user.id,
      month,
      year,
      income: incomeVal,
      needs_pct: parseFloat(needsPct),
      leisure_pct: parseFloat(leisurePct),
      investment_pct: parseFloat(investmentPct),
    };

    const { error } = settings
      ? await supabase.from("budget_settings").update(payload).eq("id", settings.id)
      : await supabase.from("budget_settings").insert(payload);

    if (error) { toast.error("Erro ao salvar orçamento"); }
    else { toast.success("Orçamento salvo!"); setEditMode(false); fetchSettings(); }
    setSaving(false);
  }

  const spentByGroup = {
    needs: transactions.filter(t => t.type === "despesa" && NEEDS_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0),
    leisure: transactions.filter(t => t.type === "despesa" && LEISURE_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0),
    investment: transactions.filter(t => t.type === "despesa" && INVESTMENT_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0),
    other: transactions.filter(t => t.type === "despesa" && OTHER_CATEGORIES.includes(t.category)).reduce((s, t) => s + t.amount, 0),
  };

  const budgetByGroup = settings ? {
    needs: settings.income * (settings.needs_pct / 100),
    leisure: settings.income * (settings.leisure_pct / 100),
    investment: settings.income * (settings.investment_pct / 100),
  } : null;

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;

  return (
    <div className="space-y-6">
      {/* Config card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Configuração do Orçamento — {month.toString().padStart(2, "0")}/{year}
          </CardTitle>
          {!editMode && (
            <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
              <Settings2 className="h-3.5 w-3.5 mr-1.5" />
              {settings ? "Editar" : "Configurar"}
            </Button>
          )}
        </CardHeader>

        {editMode ? (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Renda do mês (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 5000,00"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-green-600 dark:text-green-400 text-xs font-semibold">Necessidades %</Label>
                <Input type="number" min="0" max="100" value={needsPct} onChange={(e) => setNeedsPct(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-purple-600 dark:text-purple-400 text-xs font-semibold">Lazer %</Label>
                <Input type="number" min="0" max="100" value={leisurePct} onChange={(e) => setLeisurePct(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-600 dark:text-blue-400 text-xs font-semibold">Investimentos %</Label>
                <Input type="number" min="0" max="100" value={investmentPct} onChange={(e) => setInvestmentPct(e.target.value)} />
              </div>
            </div>
            <p className={`text-xs font-medium ${pctValid ? "text-green-600" : "text-red-500"}`}>
              Total: {total.toFixed(0)}% {pctValid ? "✓" : `(faltam ${(100 - total).toFixed(0)}%)`}
            </p>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => { setEditMode(false); fetchSettings(); }} className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
              </Button>
            </div>
          </CardContent>
        ) : settings ? (
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Renda configurada: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(settings.income)}</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Distribuição: {settings.needs_pct}% necessidades · {settings.leisure_pct}% lazer · {settings.investment_pct}% investimentos
            </p>
          </CardContent>
        ) : (
          <CardContent>
            <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum orçamento configurado para este mês.</p>
          </CardContent>
        )}
      </Card>

      {/* Budget groups */}
      {budgetByGroup && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Necessidades</CardTitle>
              <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg">
                <TrendingDown className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(budgetByGroup.needs)}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{settings!.needs_pct}% da renda</p>
              <ProgressBar spent={spentByGroup.needs} limit={budgetByGroup.needs} color="bg-green-500" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Lazer</CardTitle>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg">
                <TrendingDown className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(budgetByGroup.leisure)}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{settings!.leisure_pct}% da renda</p>
              <ProgressBar spent={spentByGroup.leisure} limit={budgetByGroup.leisure} color="bg-purple-500" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Investimentos</CardTitle>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(budgetByGroup.investment)}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{settings!.investment_pct}% da renda</p>
              <ProgressBar spent={spentByGroup.investment} limit={budgetByGroup.investment} color="bg-blue-500" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Outros</CardTitle>
              <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg">
                <CircleDashed className="h-4 w-4 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(spentByGroup.other)}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Gastos não categorizados</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 italic">Sem limite definido</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!settings && !editMode && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Configure sua renda para ver o orçamento por categoria.</p>
        </div>
      )}
    </div>
  );
}
