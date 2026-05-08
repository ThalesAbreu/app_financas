"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ExpectedIncome } from "@/lib/types";
import { Plus, Trash2, Clock, CheckCircle2, Loader2, Info } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export function ExpectedIncomeTab() {
  const [items, setItems] = useState<ExpectedIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expectedDate, setExpectedDate] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("expected_income")
      .select("*")
      .order("expected_date", { ascending: true });
    if (data) setItems(data as ExpectedIncome[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function openForm() { setDescription(""); setAmount(""); setExpectedDate(""); setShowForm(true); }

  async function handleCreate() {
    const val = parseFloat(amount.replace(",", "."));
    if (!description.trim() || isNaN(val) || val <= 0 || !expectedDate) {
      toast.error("Preencha todos os campos"); return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    const { error } = await supabase.from("expected_income").insert({
      user_id: user.id, description: description.trim(),
      amount: val, expected_date: expectedDate, received: false,
    });
    if (error) toast.error("Erro ao cadastrar");
    else { toast.success("Cadastrado!"); setShowForm(false); fetchItems(); }
    setSaving(false);
  }

  async function toggleReceived(item: ExpectedIncome) {
    const supabase = createClient();
    const { error } = await supabase
      .from("expected_income")
      .update({ received: !item.received })
      .eq("id", item.id);
    if (error) toast.error("Erro ao atualizar");
    else fetchItems();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("expected_income").delete().eq("id", id);
    if (error) toast.error("Erro ao excluir");
    else { toast.success("Excluído"); setDeletingId(null); fetchItems(); }
  }

  const pending = items.filter(i => !i.received);
  const received = items.filter(i => i.received);
  const totalPending = pending.reduce((s, i) => s + i.amount, 0);

  if (loading) return <div className="h-40 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />;

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>Os valores aqui <strong>não são somados</strong> ao saldo atual — representam dinheiro que ainda não entrou na conta.</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{pending.length} valor(es) pendente(s)</p>
          {totalPending > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">Total esperado: <span className="font-semibold text-green-600">{formatCurrency(totalPending)}</span></p>
          )}
        </div>
        <Button onClick={openForm} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-1.5" />Adicionar
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum valor a receber cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...pending, ...received].map((item) => {
            const isOverdue = !item.received && new Date(item.expected_date + "T00:00:00") < new Date();
            return (
              <Card key={item.id} className={`border-0 shadow-sm ${item.received ? "opacity-60" : ""}`}>
                <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${item.received ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}`}>
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${isOverdue ? "text-red-500 font-semibold" : "text-gray-400 dark:text-gray-500"}`}>
                        {isOverdue && "Atrasado · "}
                        {format(new Date(item.expected_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <Badge variant="outline" className={`text-xs py-0 px-1.5 ${
                        item.received
                          ? "border-green-300 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                          : isOverdue
                          ? "border-red-300 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400"
                          : "border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400"
                      }`}>
                        {item.received ? "Recebido" : isOverdue ? "Atrasado" : "Pendente"}
                      </Badge>
                    </div>
                  </div>
                  <p className={`text-sm font-bold shrink-0 ${item.received ? "text-gray-400" : "text-green-600"}`}>
                    {formatCurrency(item.amount)}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="icon" variant="ghost"
                      className={`h-7 w-7 ${item.received ? "text-gray-400" : "text-green-500 hover:text-green-700"}`}
                      onClick={() => toggleReceived(item)}
                      title={item.received ? "Marcar como pendente" : "Marcar como recebido"}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 text-gray-400 hover:text-red-600"
                      onClick={() => setDeletingId(item.id)}
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
          <DialogHeader><DialogTitle>Valor a Receber</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input placeholder="Ex: Freelance cliente X, Comissão..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input type="text" inputMode="decimal" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data esperada</Label>
              <Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
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
            <AlertDialogTitle>Excluir registro</AlertDialogTitle>
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
