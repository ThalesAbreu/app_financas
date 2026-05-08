"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Goal } from "@/lib/types";
import { Plus, Trash2, PiggyBank, Target, Loader2 } from "lucide-react";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function ProgressBar({ current, target }: { current: number; target: number }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const done = current >= target;
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>{formatCurrency(current)} guardado</span>
        <span className="font-semibold">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${done ? "bg-green-500" : "bg-blue-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs mt-1.5 text-gray-500 dark:text-gray-400">
        {done
          ? <span className="text-green-600 font-semibold">Meta atingida! 🎉</span>
          : <>Faltam <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(target - current)}</span></>
        }
      </p>
    </div>
  );
}

export function GoalsTab() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDeposit, setShowDeposit] = useState<Goal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [deposit, setDeposit] = useState("");

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
    if (data) setGoals(data as Goal[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  function openForm() { setName(""); setTarget(""); setDeadline(""); setShowForm(true); }

  async function handleCreate() {
    const targetVal = parseFloat(target.replace(",", "."));
    if (!name.trim() || isNaN(targetVal) || targetVal <= 0) {
      toast.error("Preencha nome e valor válidos");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error } = await supabase.from("goals").insert({
      user_id: user.id, name: name.trim(),
      target_amount: targetVal, current_amount: 0,
      deadline: deadline || null,
    });
    if (error) toast.error("Erro ao criar meta");
    else { toast.success("Meta criada!"); setShowForm(false); fetchGoals(); }
    setSaving(false);
  }

  async function handleDeposit() {
    if (!showDeposit) return;
    const val = parseFloat(deposit.replace(",", "."));
    if (isNaN(val) || val <= 0) { toast.error("Valor inválido"); return; }
    setSaving(true);
    const supabase = createClient();
    const newAmount = showDeposit.current_amount + val;
    const { error } = await supabase.from("goals")
      .update({ current_amount: newAmount })
      .eq("id", showDeposit.id);
    if (error) toast.error("Erro ao adicionar valor");
    else { toast.success(`${formatCurrency(val)} adicionado!`); setShowDeposit(null); setDeposit(""); fetchGoals(); }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir meta");
    else { toast.success("Meta excluída"); setDeletingId(null); fetchGoals(); }
  }

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{goals.length} meta(s) cadastrada(s)</p>
        <Button onClick={openForm} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-1.5" />Nova Meta
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma meta cadastrada. Crie sua primeira meta!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map((g) => (
            <Card key={g.id} className="border-0 shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold text-gray-800 dark:text-gray-100">{g.name}</CardTitle>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Meta: {formatCurrency(g.target_amount)}
                    {g.deadline && ` · até ${new Date(g.deadline + "T00:00:00").toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-blue-500 hover:text-blue-700"
                    onClick={() => { setShowDeposit(g); setDeposit(""); }}
                    title="Adicionar valor"
                  >
                    <PiggyBank className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-gray-400 hover:text-red-600"
                    onClick={() => setDeletingId(g.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ProgressBar current={g.current_amount} target={g.target_amount} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New goal dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Nova Meta</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nome da meta</Label>
              <Input placeholder="Ex: Viagem, Reserva de emergência..." value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Valor alvo (R$)</Label>
              <Input type="text" inputMode="decimal" placeholder="0,00" value={target} onChange={(e) => setTarget(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Prazo (opcional)</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleCreate} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deposit dialog */}
      <Dialog open={!!showDeposit} onOpenChange={() => setShowDeposit(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar valor — {showDeposit?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Guardado até agora: <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(showDeposit?.current_amount ?? 0)}</span>
            </p>
            <div className="space-y-2">
              <Label>Valor a adicionar (R$)</Label>
              <Input type="text" inputMode="decimal" placeholder="0,00" value={deposit} onChange={(e) => setDeposit(e.target.value)} autoFocus />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDeposit(null)} className="flex-1">Cancelar</Button>
              <Button onClick={handleDeposit} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir meta</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingId && handleDelete(deletingId)} className="bg-red-600 hover:bg-red-700">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
