import AvailabilityCalendar from "@/components/calendar/AvailabilityCalendar";
import { getRentals } from "@/lib/api";

export default async function CalendarPage() {
  const rentals = await getRentals();

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

      <AvailabilityCalendar rentals={rentals} />
    </div>
  );
}
