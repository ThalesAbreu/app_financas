"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Transaction, TransactionType, Category } from "@/lib/types";
import { getCategoriesForType } from "@/lib/categories";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingTransaction?: Transaction | null;
}

export function TransactionForm({
  open,
  onClose,
  onSuccess,
  editingTransaction,
}: TransactionFormProps) {
  const supabase = createClient();
  const isEditing = !!editingTransaction;

  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState(editingTransaction?.description ?? "");
  const [amount, setAmount] = useState(editingTransaction?.amount?.toString() ?? "");
  const [date, setDate] = useState(
    editingTransaction?.date ?? new Date().toISOString().split("T")[0]
  );
  const [type, setType] = useState<TransactionType>(editingTransaction?.type ?? "despesa");
  const [category, setCategory] = useState<Category | "">(editingTransaction?.category ?? "");

  const categories = getCategoriesForType(type);

  function handleTypeChange(newType: TransactionType) {
    setType(newType);
    setCategory("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!category) {
      toast.error("Selecione uma categoria");
      return;
    }

    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Valor inválido");
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Sessão expirada. Faça login novamente.");
      setLoading(false);
      return;
    }

    const updatePayload = { description, amount: parsedAmount, date, type, category };

    const { error } = isEditing
      ? await supabase
          .from("transactions")
          .update(updatePayload)
          .eq("id", editingTransaction!.id)
      : await supabase.from("transactions").insert({ ...updatePayload, user_id: user.id });

    if (error) {
      toast.error("Erro ao salvar transação", { description: error.message });
      setLoading(false);
      return;
    }

    toast.success(isEditing ? "Transação atualizada!" : "Transação criada!");
    onSuccess();
    onClose();
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Transação" : "Nova Transação"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange("receita")}
              className={`py-2.5 rounded-lg text-sm font-medium border-2 transition-colors ${
                type === "receita"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              + Receita
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("despesa")}
              className={`py-2.5 rounded-lg text-sm font-medium border-2 transition-colors ${
                type === "despesa"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              - Despesa
            </button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Supermercado, Salário..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as Category)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${type === "receita" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
