import { ReactNode, WheelEvent } from "react";
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
  pagination?: ReactNode;
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
  pagination,
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

      <div className="overflow-x-auto" onWheel={handleHorizontalWheelScroll}>
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

      {filteredCount > 0 && pagination}
    </div>
  );
}

// Con mouse (a diferencia de un touchpad) no hay forma natural de moverse a
// los lados en una tabla ancha — hay que bajar hasta el final para toparse
// con la barra de scroll horizontal. Esto convierte el scroll vertical
// normal del mouse en scroll horizontal mientras el cursor esté sobre la
// tabla, para poder ver las columnas de la derecha sin bajar. Si la tabla
// no tiene nada que desplazar (cabe completa), no se toca el scroll normal
// de la página.
function handleHorizontalWheelScroll(event: WheelEvent<HTMLDivElement>) {
  const container = event.currentTarget;
  const canScrollHorizontally = container.scrollWidth > container.clientWidth;

  if (!canScrollHorizontally || event.deltaY === 0) {
    return;
  }

  event.preventDefault();
  container.scrollLeft += event.deltaY;
}
