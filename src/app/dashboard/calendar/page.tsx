import AvailabilityCalendar from "@/components/calendar/AvailabilityCalendar";
import { getMaintenances, getRentals } from "@/lib/api";

export default async function CalendarPage() {
  const [rentals, maintenances] = await Promise.all([
    getRentals(),
    getMaintenances(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Calendario
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Visualiza la disponibilidad y ocupación de los vehículos.
        </p>
      </div>

      <AvailabilityCalendar rentals={rentals} maintenances={maintenances} />
    </div>
  );
}
