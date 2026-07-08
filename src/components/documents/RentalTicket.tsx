import Image from "next/image";
import { ReactNode } from "react";
import { Calculator, CalendarDays, ShieldCheck, Tag } from "lucide-react";
import { Rental } from "@/types/rental";

type Props = {
  rental: Rental;
};

export default function RentalTicket({ rental }: Props) {
  const days = rental.daysCharged || 1;
  const totalPrice = toMoneyNumber(rental.totalPrice);
  const dailyRate = toMoneyNumber(rental.dailyRateApplied) || totalPrice / days;
  const deposit = toMoneyNumber(rental.car?.deposit);
  const totalToCover = totalPrice + deposit;

  return (
    <article className="relative mx-auto max-w-[920px] overflow-hidden rounded-2xl bg-white text-slate-950 shadow-xl ring-1 ring-slate-200 print:w-full print:max-w-none print:overflow-visible print:rounded-none print:shadow-none print:ring-0">
      <Image
        src="/documents/Logo.png"
        alt=""
        width={520}
        height={320}
        aria-hidden="true"
        priority
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] print:fixed print:opacity-[0.08]"
      />

      <div className="relative z-10 space-y-6 p-5 sm:p-7 print:space-y-3 print:p-0">
        <div className="flex justify-end">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right print:px-3 print:py-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fecha de cotizacion
            </p>
            <p className="mt-1 text-sm font-bold text-slate-950">
              {formatShortDate(new Date().toISOString())}
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 print:rounded-lg">
          <div className="bg-[#0b477d] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white print:px-3 print:py-2 print:text-xs">
            Detalle de la cotizacion
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm print:min-w-0 print:table-fixed print:text-[9pt]">
              <thead>
                <tr className="bg-[#0b477d] text-white">
                  <th className="w-[34%] border-r border-white/25 px-5 py-3 print:w-[32%] print:px-2 print:py-2">
                    Concepto
                  </th>
                  <th className="w-[43%] border-r border-white/25 px-5 py-3 print:w-[46%] print:px-2 print:py-2">
                    Detalle
                  </th>
                  <th className="px-5 py-3 text-right print:w-[22%] print:px-2 print:py-2">
                    Importe (MXN)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <QuoteRow
                  icon={<CalendarDays size={24} />}
                  concept="Periodo de renta"
                  detail={`${formatLongDate(rental.startDate)} al ${formatLongDate(
                    rental.endDate
                  )} (${days} ${days === 1 ? "dia" : "dias"})`}
                  amount="-"
                />
                <QuoteRow
                  icon={<Tag size={24} />}
                  concept="Tarifa diaria"
                  detail={`${formatMoney(dailyRate)} por dia - ${formatPriceMode(
                    rental.priceMode
                  )}`}
                  amount={formatMoney(dailyRate)}
                />
                <QuoteRow
                  icon={<Calculator size={24} />}
                  concept={`Total renta (${days} ${days === 1 ? "dia" : "dias"})`}
                  detail={`Tarifa diaria x ${days} ${days === 1 ? "dia" : "dias"}`}
                  amount={formatMoney(totalPrice)}
                />
                <QuoteRow
                  icon={<ShieldCheck size={24} />}
                  concept="Deposito en garantia"
                  detail="Reembolsable al finalizar la renta, una vez que el vehiculo sea devuelto en las condiciones establecidas."
                  amount={formatMoney(deposit)}
                  stackedConcept="(reembolsable)"
                />
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid overflow-hidden rounded-2xl bg-slate-950 text-white md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] print:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] print:rounded-lg">
          <div className="flex items-center bg-[#0b477d] px-6 py-5 md:[clip-path:polygon(0_0,92%_0,100%_100%,0_100%)] print:[clip-path:none] print:px-3 print:py-3">
            <p className="text-lg font-bold uppercase leading-tight tracking-wide print:text-[11pt]">
              Total a cubrir al recibir el vehiculo
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-5 print:gap-2 print:px-3 print:py-3">
            <span className="text-4xl font-bold tracking-normal tabular-nums sm:text-5xl print:text-[24pt]">
              {formatMoney(totalToCover)}
            </span>
            <span className="text-base font-bold text-slate-300 print:text-[10pt]">
              MXN
            </span>
          </div>
        </section>

        <section className="grid gap-4 text-sm text-slate-600 md:grid-cols-2 print:gap-3 print:text-[9pt]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 print:rounded-lg print:p-3">
            <p className="font-semibold text-slate-900">Notas</p>
            <p className="mt-2">
              La cotizacion contempla la renta y el deposito en garantia. No
              incluye cargos por danos, combustible, limpieza o retrasos.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 print:rounded-lg print:p-3">
            <p className="font-semibold text-slate-900">Vigencia</p>
            <p className="mt-2">
              Sujeta a disponibilidad del vehiculo y confirmacion del periodo de
              renta.
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}

function QuoteRow({
  icon,
  concept,
  stackedConcept,
  detail,
  amount,
}: {
  icon: ReactNode;
  concept: string;
  stackedConcept?: string;
  detail: string;
  amount: string;
}) {
  return (
    <tr className="align-middle">
      <td className="border-r border-slate-200 px-5 py-4 print:px-2 print:py-2">
        <div className="flex items-center gap-4 print:gap-2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b477d] print:h-7 print:w-7 print:rounded-md">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="break-words font-bold uppercase text-slate-950">
              {concept}
            </p>
            {stackedConcept && (
              <p className="text-xs font-bold uppercase text-[#0b477d] print:text-[8pt]">
                {stackedConcept}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="break-words border-r border-slate-200 px-5 py-4 leading-6 text-slate-700 print:px-2 print:py-2 print:leading-5">
        {detail}
      </td>
      <td className="break-words px-5 py-4 text-right text-lg font-bold tabular-nums text-slate-950 print:px-2 print:py-2 print:text-[10pt]">
        {amount}
      </td>
    </tr>
  );
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatPriceMode(priceMode: string) {
  const labels: Record<string, string> = {
    NORMAL: "Precio normal",
    TEMPORADA_ALTA: "Temporada alta",
  };

  return labels[priceMode] ?? "Precio normal";
}

function formatMoney(value: number | string | null | undefined) {
  return `$${toMoneyNumber(value).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
