"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CATEGORY_COLORS } from "@/lib/categories";
import { TransactionForm } from "./TransactionForm";

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function TransactionList({ transactions, onRefresh }: TransactionListProps) {
  const supabase = createClient();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao excluir transação");
      return;
    }

    toast.success("Transação excluída");
    setDeletingId(null);
    onRefresh();
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-500">
        <p className="text-lg">Nenhuma transação encontrada</p>
        <p className="text-sm mt-1">Ajuste os filtros ou adicione uma nova transação</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800/50">
              <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Data</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Descrição</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">Categoria</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tipo</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Valor</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                <TableCell className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-[200px] truncate">
                  {t.description}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: CATEGORY_COLORS[t.category] + "40",
                      backgroundColor: CATEGORY_COLORS[t.category] + "15",
                      color: CATEGORY_COLORS[t.category],
                    }}
                  >
                    {t.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`text-xs ${
                      t.type === "receita"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100"
                    }`}
                    variant="secondary"
                  >
                    {t.type === "receita" ? "Receita" : "Despesa"}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-sm font-semibold text-right ${
                    t.type === "receita" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.type === "receita" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-blue-600"
                      onClick={() => setEditingTransaction(t)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                      onClick={() => setDeletingId(t.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingTransaction && (
        <TransactionForm
          open={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={onRefresh}
          editingTransaction={editingTransaction}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
