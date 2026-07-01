"use client";

import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/shadcn-ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  accessor?: (row: T) => any;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string | number;
}

export function DataTable<T>({ data, columns, rowKey }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find(c => c.key === sortKey);
    if (!col) return data;

    return [...data].sort((a, b) => {
      const valA = col.accessor ? col.accessor(a) : (a as any)[sortKey];
      const valB = col.accessor ? col.accessor(b) : (b as any)[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const order = sortAsc ? 1 : -1;
      if (typeof valA === "string" && typeof valB === "string") {
        return valA.localeCompare(valB) * order;
      }
      return (valA < valB ? -1 : 1) * order;
    });
  }, [data, sortKey, sortAsc, columns]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-100/50 dark:bg-white/[0.02]">
            <TableRow className="border-b border-slate-200 dark:border-white/10">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable)}
                  className={`text-xs font-bold text-slate-400 uppercase tracking-wider py-4 px-6 ${
                    col.sortable ? "cursor-pointer select-none hover:text-slate-600 dark:hover:text-white" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row) => (
              <TableRow
                key={rowKey(row)}
                className="border-b border-slate-100 dark:border-white/[0.05] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors"
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className="py-4 px-6 text-sm text-slate-700 dark:text-slate-300"
                  >
                    {col.render ? col.render(row) : col.accessor ? col.accessor(row) : (row as any)[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
