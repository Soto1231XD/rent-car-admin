// Folio corto y legible para mostrarle al cliente/staff (ej. "RMV-000123"),
// derivado del membershipNumber autoincremental que ya viene en la
// respuesta del backend.
export function formatMembershipNumber(membershipNumber: number): string {
  return `RMV-${String(membershipNumber).padStart(6, "0")}`;
}
