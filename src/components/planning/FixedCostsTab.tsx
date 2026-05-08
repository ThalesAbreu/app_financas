"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { FixedCost, FixedCostPayment } from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/categories";
import { Plus, Trash2, CheckCircle2, Loader2, Receipt } from "lucide-react";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function getStatus(cost: FixedCost, payments: FixedCostPayment[], month: number, year: number) {
  const isPaid = payments.some(p => p.fixed_cost_id === cost.id && p.month === month && p.year === year);
  if (isPaid) return "paid";
  const today = new Date();
  const dueDate = new Date(year, month - 1, cost.due_day);
  return today > dueDate ? "overdue" : "pending";
}

const STATUS_STYLES = {
  paid:    { badge: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800", label: "Pago", dot: "bg-green-500" },
  overdue: { badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800", label: "Vencido", dot: "bg-red-500" },
  pending: { badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800", label: "Pendente", dot: "bg-amber-400" },
};

export function FixedCostsTab() {
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  const [costs, setCosts] = useState<FixedCost[]>([]);
  const [payments, setPayments] = useState<FixedCostPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [dueDay, setDueDay] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: costsData }, { data: paymentsData }] = await Promise.all([
      supabase.from("fixed_costs").select("*").eq("active", true).order("due_day"),
      supabase.from("fixed_cost_payments").select("*").eq("month", month).eq("year", year),
    ]);
    if (costsData) setCosts(costsData as FixedCost[]);
    if (paymentsData) setPayments(paymentsData as FixedCostPayment[]);
    setLoading(false);
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openForm() { setName(""); setAmount(""); setCategory(""); setDueDay(""); setShowForm(true); }

  async function handleCreate() {
    const val = parseFloat(amount.replace(",", "."));
    const day = parseInt(dueDay);
    if (!name.trim() || isNaN(val) || val <= 0 || !category || isNaN(day) || day < 1 || day > 31) {
      toast.error("Preencha todos os campos corretamente"); return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error } = await supabase.from("fixed_costs").insert({
      user_id: user.id, name: name.trim(), amount: val, category, due_day: day, active: true,
    });
    if (error) toast.error("Erro ao cadastrar custo fixo");
    else { toast.success("Custo fixo cadastrado!"); setShowForm(false); fetchData(); }
    setSaving(false);
  }

  async function togglePayment(cost: FixedCost) {
    const supabase = createClient();
    const isPaid = payments.some(p => p.fixed_cost_id === cost.id && p.month === month && p.year === year);
    if (isPaid) {
      const payment = payments.find(p => p.fixed_cost_id === cost.id && p.month === month && p.year === year)!;
      const { error } = await supabase.from("fixed_cost_payments").delete().eq("id", payment.id);
      if (error) toast.error("Erro ao atualizar");
      else { toast.success("Marcado como não pago"); fetchData(); }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("fixed_cost_payments").insert({
        fixed_cost_id: cost.id, user_id: user.id, month, year,
      });
      if (error) toast.error("Erro ao registrar pagamento");
      else { toast.success("Marcado como pago ✓"); fetchData(); }
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("fixed_costs").update({ active: false }).eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Custo fixo removido"); setDeletingId(null); fetchData(); }
  }

  const totalMonth = costs.reduce((s, c) => s + c.amount, 0);
  const totalPaid = costs
    .filter(c => payments.some(p => p.fixed_cost_id === c.id && p.month === month && p.year === year))
    .reduce((s, c) => s + c.amount, 0);

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {costs.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Total mês</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(totalMonth)}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center border border-green-100 dark:border-green-800">
            <p className="text-xs text-green-600 dark:text-green-400 mb-1">Pago</p>
            <p className="text-sm font-bold text-green-700 dark:text-green-300">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center border border-amber-100 dark:border-amber-800">
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">A pagar</p>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{formatCurrency(totalMonth - totalPaid)}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{costs.length} custo(s) fixo(s)</p>
        <Button onClick={openForm} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-1.5" />Adicionar
        </Button>
      </div>

      {costs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Receipt className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum custo fixo cadastrado.</p>
          <p className="text-xs mt-1">Adicione despesas recorrentes como academia, streaming, contas...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {costs.map((cost) => {
            const status = getStatus(cost, payments, month, year);
            const s = STATUS_STYLES[status];
            return (
              <Card key={cost.id} className="border-0 shadow-sm">
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{cost.name}</p>
                      <Badge variant="outline" className={`text-xs py-0 px-1.5 ${s.badge}`}>{s.label}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {cost.category} · vence dia {cost.due_day}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">{formatCurrency(cost.amount)}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon" variant="ghost"
                      className={`h-7 w-7 ${status === "paid" ? "text-green-500 hover:text-green-700" : "text-gray-400 hover:text-green-600"}`}
                      onClick={() => togglePayment(cost)}
                      title={status === "paid" ? "Marcar como não pago" : "Marcar como pago"}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 text-gray-400 hover:text-red-600"
                      onClick={() => setDeletingId(cost.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Novo Custo Fixo</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input placeholder="Ex: Netflix, Academia, Água..." value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="text" inputMode="decimal" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Dia de vencimento</Label>
                <Input type="number" min="1" max="31" placeholder="Ex: 10" value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleCreate} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover custo fixo</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza? O custo fixo será removido da lista.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && handleDelete(deletingId)} className="bg-red-600 hover:bg-red-700">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
