import { ReactNode } from "react";
import EmptyState from "@/components/ui/EmptyState";

type DataTableShellProps = {
  children: ReactNode;
  filters: ReactNode;
  filteredCount: number;
  totalCount: number;
  itemLabel: string;
  hasFilters: boolean;
  onClearFilters: () => void;
  emptyTitle: string;
  emptyDescription: string;
};

export default function DataTableShell({
  children,
  filters,
  filteredCount,
  totalCount,
  itemLabel,
  hasFilters,
  onClearFilters,
  emptyTitle,
  emptyDescription,
}: DataTableShellProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        {filters}

        <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-500">
            Mostrando {filteredCount} de {totalCount} {itemLabel}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="font-medium text-slate-700 hover:text-slate-900 hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {children}

        {filteredCount === 0 && (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={hasFilters ? "Limpiar filtros" : undefined}
            onAction={hasFilters ? onClearFilters : undefined}
          />
        )}
      </div>
    </div>
  );
}
