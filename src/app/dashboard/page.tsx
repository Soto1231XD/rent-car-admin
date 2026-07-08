import Link from "next/link";
import {
  CalendarDays,
  Car,
  DollarSign,
  Plus,
  ReceiptText,
  UserPlus,
  Users,
  Wrench,
} from "lucide-react";
import { getDashboardSummary, getExtraExpenses } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import { Rental } from "@/types/rental";
import { Maintenance } from "@/types/maintenance";
import { ExtraExpense } from "@/types/extra-expense";

export default async function DashboardPage() {
  const [summary, extraExpenses] = await Promise.all([
    getDashboardSummary(),
    getExtraExpenses(),
  ]);

  if (!summary) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          No se pudo cargar el resumen. Revisa que el backend esté encendido y
          vuelve a intentar.
        </p>
      </div>
    );
  }

  const activeOrReservedRentals = summary.upcomingRentals;
  const pendingMaintenances = summary.pendingMaintenanceList;
  const monthlyIncome = summary.income.currentMonth;
  const monthlyCommissionerIncome = summary.income.commissionerCurrentMonth;
  const monthlyExtraExpenses = getMonthlyPaidExtraExpenses(extraExpenses);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Resumen operativo del sistema de renta de vehículos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <SummaryCard
          title="Carros disponibles"
          value={summary.cars.available}
          detail={`${summary.cars.total} unidades registradas`}
          icon={<Car />}
          className="xl:col-span-2"
        />
        <SummaryCard
          title="Rentas activas"
          value={summary.rentals.active}
          detail={`${summary.rentals.reserved} reservaciones`}
          icon={<CalendarDays />}
          className="xl:col-span-2"
        />
        <SummaryCard
          title="Clientes"
          value={summary.clients.total}
          detail="Clientes registrados"
          icon={<Users />}
          className="xl:col-span-2"
        />
        <SummaryCard
          title="Ingreso del mes"
          value={formatSummaryMoney(monthlyIncome)}
          detail="Ingreso registrado este mes, MXN"
          icon={<DollarSign />}
          className="xl:col-span-2"
          valueClassName="text-2xl sm:text-3xl"
        />
        <SummaryCard
          title="Comisionistas"
          value={formatSummaryMoney(monthlyCommissionerIncome)}
          detail="Ingreso mensual de comisionistas, MXN"
          icon={<DollarSign />}
          className="xl:col-span-2"
          valueClassName="text-2xl sm:text-3xl"
        />
        <SummaryCard
          title="Gastos extras"
          value={formatSummaryMoney(monthlyExtraExpenses)}
          detail="Gastos pagados este mes, MXN"
          icon={<ReceiptText />}
          className="xl:col-span-2"
          valueClassName="text-2xl sm:text-3xl"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <StatusPanel
          title="Flota"
          items={[
            ["Disponibles", summary.cars.available],
            ["Rentados", summary.cars.rented],
            ["Mantenimiento", summary.cars.maintenance],
            ["No disponibles", summary.cars.unavailable],
          ]}
        />
        <StatusPanel
          title="Rentas"
          items={[
            ["Activas", summary.rentals.active],
            ["Reservaciones", summary.rentals.reserved],
            ["Completadas", summary.rentals.completed],
          ]}
        />
        <StatusPanel
          title="Mantenimiento"
          items={[
            ["Pendientes", summary.maintenances.pending],
            ["En progreso", summary.maintenances.inProgress],
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
            <SectionHeader
              title="Próximas rentas"
              description="Rentas activas o reservadas más cercanas."
              href="/dashboard/rentals"
              action="Ver todas"
            />

            {activeOrReservedRentals.length === 0 ? (
              <EmptyPanel text="No hay rentas activas ni reservadas por ahora." />
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {activeOrReservedRentals.map((rental) => (
                    <Link
                      key={rental.id}
                      href={`/dashboard/rentals/${rental.id}`}
                      className="block rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {getRentalClientName(rental)}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {getRentalCarName(rental)}
                          </p>
                        </div>
                        <StatusBadge status={rental.status} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs font-medium text-slate-500">
                            Entrega
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {formatDate(rental.startDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-500">
                            Total
                          </p>
                          <p className="mt-1 font-semibold text-slate-900">
                            {formatMoney(rental.totalPrice)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Cliente</th>
                        <th className="px-4 py-3 font-medium">Vehículo</th>
                        <th className="px-4 py-3 font-medium">Entrega</th>
                        <th className="px-4 py-3 font-medium">Estado</th>
                        <th className="px-4 py-3 font-medium">Total</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {activeOrReservedRentals.map((rental) => (
                        <tr key={rental.id}>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {getRentalClientName(rental)}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {getRentalCarName(rental)}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {formatDate(rental.startDate)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={rental.status} />
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {formatMoney(rental.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
            <SectionHeader
              title="Mantenimientos pendientes"
              description="Servicios pendientes o en progreso."
              href="/dashboard/maintenance"
              action="Ver todos"
            />

            {pendingMaintenances.length === 0 ? (
              <EmptyPanel text="No hay mantenimientos pendientes." />
            ) : (
              <div className="space-y-3">
                {pendingMaintenances.map((maintenance) => (
                  <div
                    key={maintenance.id}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">
                        {getMaintenanceCarName(maintenance)}
                      </p>
                      <p className="text-sm text-slate-500">
                        {maintenance.serviceType} · {formatDate(maintenance.date)}
                      </p>
                    </div>

                    <StatusBadge status={maintenance.status} />
                  </div>
                ))}
              </div>
            )}
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
  detail,
  icon,
  className = "",
  valueClassName = "text-3xl",
}: {
  title: string;
  value: number | string;
  detail: string;
  icon: React.ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p
            className={`mt-2 break-words font-bold leading-tight tracking-normal text-slate-900 tabular-nums ${valueClassName}`}
          >
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusPanel({
  title,
  items,
}: {
  title: string;
  items: [string, number][];
}) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow sm:p-5">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-600">{label}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <Link href={href} className="text-sm font-medium text-slate-900 hover:underline">
        {action}
      </Link>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function getRentalCarName(rental: Rental) {
  if (!rental.car) {
    return "Vehículo no disponible";
  }

  return `${rental.car.brand} ${rental.car.model} ${rental.car.year}`;
}

function getRentalClientName(rental: Rental) {
  return rental.client?.fullName ?? "Cliente no disponible";
}

function getMaintenanceCarName(maintenance: Maintenance) {
  if (!maintenance.car) {
    return "Vehículo no disponible";
  }

  return `${maintenance.car.brand} ${maintenance.car.model} ${maintenance.car.year}`;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return `$${toMoneyNumber(value).toLocaleString("es-MX")} MXN`;
}

function formatSummaryMoney(value: number | string | null | undefined) {
  return `$${toMoneyNumber(value).toLocaleString("es-MX")}`;
}

function getMonthlyPaidExtraExpenses(extraExpenses: ExtraExpense[]) {
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const nextMonthStart = new Date(currentMonthStart);
  nextMonthStart.setMonth(currentMonthStart.getMonth() + 1);

  return extraExpenses
    .filter((extraExpense) => {
      if (extraExpense.status !== "PAGADO") {
        return false;
      }

      const date = new Date(extraExpense.date);

      return date >= currentMonthStart && date < nextMonthStart;
    })
    .reduce((total, extraExpense) => total + toMoneyNumber(extraExpense.cost), 0);
}

function toMoneyNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsedValue = Number(value.replace(/,/g, "").trim());

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  return 0;
}
