import { Transaction } from "./types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function exportToCSV(transactions: Transaction[], filename: string) {
  const headers = ["Data", "Descrição", "Categoria", "Tipo", "Valor (R$)"];

  const rows = transactions.map((t) => [
    format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR }),
    t.description,
    t.category,
    t.type === "receita" ? "Receita" : "Despesa",
    t.amount.toFixed(2).replace(".", ","),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(";"))
    .join("\n");

  const blob = new Blob(["﻿" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
