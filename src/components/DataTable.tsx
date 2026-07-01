"use client";

import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/shadcn-ui/table";
import { Button } from "@/components/shadcn-ui/button";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (item: T) => string | number;
  showEdit?: boolean;
  onEdit?: (item: T) => void;
  showDelete?: boolean;
  onDelete?: (item: T) => void;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (item: T) => void;
  }[];
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  showEdit,
  onEdit,
  showDelete,
  onDelete,
  actions = [],
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  const hasActions = showEdit || showDelete || actions.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-100/50 dark:bg-white/[0.02]">
            <TableRow className="border-b border-slate-200 dark:border-white/10">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={`text-xs font-bold text-slate-400 uppercase tracking-wider py-4 px-6 ${col.className || ""}`}
                >
                  {col.header}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4 px-6 text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="py-12 text-center text-sm text-slate-400"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={rowKey(item)}
                  className="border-b border-slate-100 dark:border-white/[0.05] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={`py-4 px-6 text-sm text-slate-700 dark:text-slate-300 ${col.className || ""}`}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {actions.map((act, idx) => (
                          <Button
                            key={idx}
                            variant="ghost"
                            size="icon"
                            onClick={() => act.onClick(item)}
                            className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                            title={act.label}
                          >
                            {act.icon}
                          </Button>
                        ))}
                        {showEdit && onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                            className="h-8 w-8 text-slate-400 hover:text-emerald-500 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                        {showDelete && onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                            className="h-8 w-8 text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
