import Link from "next/link";
import { CalendarDays, Car, Plus, UserPlus, Wrench } from "lucide-react";
import { cars, rentals, maintenances } from "@/lib/mock-data";
import StatusBadge from "@/components/ui/StatusBadge";

export default function DashboardPage() {
  const totalCars = cars.length;
 const availableCars = cars.filter((car) => car.status === "DISPONIBLE").length;

const maintenanceCars = cars.filter(
  (car) => car.status === "MANTENIMIENTO"
).length;

const activeRentals = rentals.filter((rental) => rental.status === "ACTIVO");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Resumen operativo del sistema de renta de vehículos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total de carros" value={totalCars} icon={<Car />} />
        <SummaryCard title="Disponibles" value={availableCars} icon={<Car />} />
        <SummaryCard title="Rentas activas" value={activeRentals.length} icon={<CalendarDays />} />
        <SummaryCard title="Mantenimiento" value={maintenanceCars} icon={<Wrench />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Rentas activas
                </h2>
                <p className="text-sm text-slate-500">
                  Vehículos actualmente en uso.
                </p>
              </div>

              <Link
                href="/dashboard/rentals"
                className="text-sm font-medium text-slate-900 hover:underline"
              >
                Ver todas
              </Link>
            </div>

            <div className="space-y-3 md:hidden">
              {activeRentals.map((rental) => (
                <Link
                  key={rental.id}
                  href={`/dashboard/rentals/${rental.id}`}
                  className="block rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {rental.clientName}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {rental.carName}
                      </p>
                    </div>
                    <StatusBadge status={rental.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Devolucion
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {rental.endDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Total
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">
                        ${rental.totalPrice.toLocaleString("es-MX")} MXN
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
              <table className="min-w-[680px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Vehículo</th>
                    <th className="px-4 py-3 font-medium">Devolución</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {activeRentals.map((rental) => (
                    <tr key={rental.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {rental.clientName}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {rental.carName}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {rental.endDate}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        ${rental.totalPrice.toLocaleString("es-MX")} MXN
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Mantenimientos recientes
                </h2>
                <p className="text-sm text-slate-500">
                  Servicios registrados para las unidades.
                </p>
              </div>

              <Link
                href="/dashboard/maintenance"
                className="text-sm font-medium text-slate-900 hover:underline"
              >
                Ver todos
              </Link>
            </div>

            <div className="space-y-3">
              {maintenances.map((maintenance) => (
                <div
                  key={maintenance.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {maintenance.carName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {maintenance.serviceType} · {maintenance.date}
                    </p>
                  </div>

                  <StatusBadge status={maintenance.status} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="order-first space-y-6 xl:order-none">
          <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Accesos rápidos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Acciones frecuentes del sistema.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <QuickAction
                href="/dashboard/rentals/new"
                icon={<Plus />}
                title="Nueva renta"
                description="Registrar una renta o reservación"
              />

              <QuickAction
                href="/dashboard/clients/new"
                icon={<UserPlus />}
                title="Nuevo cliente"
                description="Agregar datos de un cliente"
              />

              <QuickAction
                href="/dashboard/cars/new"
                icon={<Car />}
                title="Nuevo carro"
                description="Registrar una unidad"
              />

              <QuickAction
                href="/dashboard/maintenance/new"
                icon={<Wrench />}
                title="Mantenimiento"
                description="Registrar servicio de vehículo"
              />

              <QuickAction
                href="/dashboard/calendar"
                icon={<CalendarDays />}
                title="Calendario"
                description="Consultar disponibilidad"
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm shadow-slate-900/20">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </Link>
  );
}
