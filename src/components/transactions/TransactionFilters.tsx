"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionFilters, Category } from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/categories";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: format(new Date(2000, i, 1), "MMMM", { locale: ptBR }),
}));

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

export function TransactionFiltersBar({ filters, onChange }: TransactionFiltersProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por descrição..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9 h-10"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-2">
        <Select
          value={filters.month.toString()}
          onValueChange={(v) => v && onChange({ ...filters, month: parseInt(v) })}
        >
          <SelectTrigger className="h-9 text-sm sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={m.value.toString()}>
                {m.label.charAt(0).toUpperCase() + m.label.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.year.toString()}
          onValueChange={(v) => v && onChange({ ...filters, year: parseInt(v) })}
        >
          <SelectTrigger className="h-9 text-sm sm:w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {YEARS.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(v) => v && onChange({ ...filters, category: v as Category | "todas" })}
        >
          <SelectTrigger className="h-9 text-sm sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {ALL_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
