type Props = {
  status: string;
};

export default function StatusBadge({ status }: Props) {
  const normalizedStatus = status.toUpperCase();

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${getStyles(
        normalizedStatus
      )}`}
    >
      {formatLabel(normalizedStatus)}
    </span>
  );
}

function getStyles(status: string) {
  switch (status) {
    case "DISPONIBLE":
    case "AVAILABLE":
    case "COMPLETADO":
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";

    case "MANTENIMIENTO":
    case "PENDIENTE":
    case "MAINTENANCE":
    case "PENDING":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

    case "ACTIVO":
    case "ACTIVA":
    case "ACTIVE":
    case "EN PROGRESO":
    case "IN_PROGRESS":
      return "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200";

    case "CANCELADO":
    case "CANCELADA":
    case "CANCELLED":
    case "FUERA DE SERVICIO":
    case "OUT_OF_SERVICE":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";

    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";

    case "RENTADO":
      return "bg-blue-100 text-blue-700";
    case "NO DISPONIBLE":
      return "bg-red-100 text-red-700";
  }
}

function formatLabel(status: string) {
  switch (status) {
    case "AVAILABLE":
      return "Disponible";
    case "DISPONIBLE":
      return "Disponible";

    case "MAINTENANCE":
      return "Mantenimiento";
    case "MANTENIMIENTO":
      return "Mantenimiento";

    case "OUT_OF_SERVICE":
      return "Fuera de servicio";
    case "FUERA DE SERVICIO":
      return "Fuera de servicio";

    case "ACTIVE":
      return "Activa";
    case "ACTIVO":
      return "Activo";
    case "ACTIVA":
      return "Activa";

    case "COMPLETED":
      return "Completado";
    case "COMPLETADO":
      return "Completado";

    case "PENDING":
      return "Pendiente";
    case "PENDIENTE":
      return "Pendiente";

    case "IN_PROGRESS":
      return "En progreso";
    case "EN PROGRESO":
      return "En progreso";

    case "CANCELLED":
      return "Cancelado";
    case "CANCELADO":
      return "Cancelado";
    case "CANCELADA":
      return "Cancelada";

    case "RENTADO":
      return "Rentado";

    case "NO DISPONIBLE":
      return "No disponible";

    default:
      return status;
  }
}
