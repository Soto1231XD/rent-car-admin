import Image from "next/image";
import {
  Briefcase,
  Calculator,
  CalendarDays,
  Fuel,
  MessageCircle,
  Phone,
  ShieldCheck,
  Tag,
  ThumbsUp,
  Users,
} from "lucide-react";
import { ReactNode } from "react";
import { Quote } from "@/types/quote";
import { getAssetUrl } from "@/lib/assets";

const WHATSAPP_DISPLAY = "998 399 8112";

const conditions = [
  "Edad mínima del conductor: 18 años.",
  "Licencia de conducir vigente.",
  "Tarjeta de crédito o débito a nombre del conductor para el depósito.",
  "El vehículo se entrega con tanque lleno y debe devolverse igual.",
  "Kilometraje libre.",
  "No incluye seguro de daños a terceros (opcional con costo adicional).",
  "Cualquier multa, daño o pérdida es responsabilidad del arrendatario.",
  "Vigencia de la cotización: 3 días naturales.",
];

type Props = {
  quote: Quote;
  qrDataUrl: string | null;
};

export default function QuoteDocument({ quote, qrDataUrl }: Props) {
  const car = quote.car;
  const carName = car ? `${car.brand} ${car.model} ${car.year}` : "Vehículo no disponible";
  const carPhoto = car?.images?.[0] ? getAssetUrl(car.images[0]) : null;
  const days = quote.daysCharged;

  return (
    <article
      className="relative mx-auto max-w-[860px] overflow-hidden rounded-2xl bg-white text-slate-950 shadow-xl ring-1 ring-slate-200 print:w-full print:max-w-none print:overflow-visible print:rounded-none print:shadow-none print:ring-0"
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      <header className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(11,71,125,0.55),transparent_55%)]" />

        <div className="relative flex flex-wrap items-center justify-between gap-4 p-6 print:p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
              <Image
                src="/documents/Logo.png"
                alt=""
                width={80}
                height={80}
                className="h-full w-full object-contain"
              />
            </span>
            <div>
              <p className="text-lg font-black uppercase leading-none tracking-tight">
                Rentamivar
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Renta automovilística
              </p>
            </div>
          </div>

          <div>
            <p className="text-2xl font-black uppercase leading-none">
              Cotización
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#5b9bd5]">
              Renta de auto
            </p>
          </div>

          <div className="rounded-xl bg-[#0b477d] px-4 py-3 text-right print:px-3 print:py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-blue-200">
              Folio
            </p>
            <p className="text-sm font-bold tracking-wide">{quote.folio}</p>
            <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wide text-blue-200">
              Fecha
            </p>
            <p className="text-sm font-bold">
              {formatLongDate(quote.createdAt ?? quote.startDate)}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap justify-center gap-6 border-b border-slate-200 bg-slate-50 px-6 py-4 print:py-2">
        <TrustBadge icon={<ShieldCheck size={18} />} label="Unidades seguras" />
        <TrustBadge icon={<ThumbsUp size={18} />} label="Excelente servicio" />
        <TrustBadge icon={<Tag size={18} />} label="Precios competitivos" />
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2 print:p-4">
        <div className="space-y-6">
          <section>
            <SectionLabel text="Datos del cliente" />
            <div className="mt-3 space-y-3 text-sm">
              <BlankLine label="Nombre" />
              <BlankLine label="Teléfono" />
              <BlankLine label="Correo" />
            </div>
          </section>

          <section>
            <SectionLabel text="Vehículo" />
            <p className="mt-2 text-xl font-black uppercase tracking-tight">
              {carName}
            </p>
            {car && (
              <p className="mt-1 text-sm text-slate-600">
                {car.transmission}
                {car.hasCarPlay ? " · CarPlay" : ""}
              </p>
            )}

            {car && (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold uppercase text-slate-700">
                <SpecBadge icon={<Users size={16} />} label={`${car.passengers} pasajeros`} />
                <SpecBadge
                  icon={<Briefcase size={16} />}
                  label={car.trunkCapacity || "Cajuela estándar"}
                />
                <SpecBadge
                  icon={<Fuel size={16} />}
                  label={car.engineType || "Combustible no definido"}
                />
              </div>
            )}
          </section>
        </div>

        <div className="relative min-h-[220px] overflow-hidden rounded-2xl bg-slate-100">
          {carPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={carPhoto}
              alt={carName}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">
              Imagen no disponible
            </div>
          )}

          {car && (
            <div className="absolute bottom-3 right-3 rounded-lg bg-[#0b477d] px-3 py-1.5 text-sm font-black uppercase text-white shadow-lg">
              {car.model} {car.year}
            </div>
          )}
        </div>
      </div>

      <section className="mx-6 overflow-hidden rounded-2xl border border-slate-200 print:mx-4">
        <div className="bg-[#0b477d] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white print:px-3 print:py-2 print:text-xs">
          Detalle de la cotización
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-[680px] border-collapse text-left text-sm print:min-w-0 print:table-fixed print:text-[9pt]">
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
                icon={<CalendarDays size={22} />}
                concept="Periodo de renta"
                detail={`Del ${formatShortDate(quote.startDate)} al ${formatShortDate(
                  quote.endDate
                )} (${days} ${days === 1 ? "día" : "días"})`}
                amount="—"
              />
              <QuoteRow
                icon={<Tag size={22} />}
                concept="Tarifa diaria"
                detail={`${formatMoney(quote.dailyRateApplied)} por día - ${formatPriceMode(
                  quote.priceMode
                )}`}
                amount={formatMoney(quote.dailyRateApplied)}
              />
              <QuoteRow
                icon={<Calculator size={22} />}
                concept={`Total renta (${days} ${days === 1 ? "día" : "días"})`}
                detail={`Tarifa diaria x ${days} ${days === 1 ? "día" : "días"}`}
                amount={formatMoney(quote.totalPrice)}
              />
              <QuoteRow
                icon={<ShieldCheck size={22} />}
                concept="Depósito en garantía"
                stackedConcept="(reembolsable)"
                detail="Se reembolsa al finalizar la renta, una vez que el vehículo sea devuelto en las condiciones establecidas en el contrato."
                amount={formatMoney(quote.deposit)}
              />
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-6 mt-4 grid overflow-hidden rounded-2xl bg-slate-950 text-white md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] print:mx-4 print:mt-3 print:rounded-lg">
        <div className="flex items-center bg-[#0b477d] px-6 py-5 md:[clip-path:polygon(0_0,92%_0,100%_100%,0_100%)] print:[clip-path:none] print:px-3 print:py-3">
          <p className="text-base font-bold uppercase leading-tight tracking-wide print:text-[10pt]">
            Total a cubrir al recibir el vehículo
          </p>
        </div>

        <div className="flex items-center justify-end px-6 py-5 print:px-3 print:py-3">
          <span className="text-3xl font-bold tracking-normal tabular-nums sm:text-4xl print:text-[20pt]">
            {formatMoney(quote.totalPrice + quote.deposit)}
          </span>
        </div>
      </section>

      <section className="grid gap-4 p-6 md:grid-cols-3 print:p-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2 print:rounded-lg print:p-3">
          <p className="text-sm font-bold uppercase text-slate-900">Importante</p>
          <p className="mt-2 text-sm text-slate-600">
            El depósito en garantía de {formatMoney(quote.deposit)} es 100%
            reembolsable al finalizar la renta.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center print:rounded-lg print:p-3">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrDataUrl} alt="Código QR de WhatsApp" className="h-24 w-24 print:h-20 print:w-20" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500">
              QR
            </div>
          )}
          <p className="text-xs font-bold uppercase text-slate-700">
            Escanea para escribirnos
          </p>
        </div>
      </section>

      <section className="grid gap-6 border-t border-slate-200 p-6 md:grid-cols-2 print:p-4">
        <div>
          <p className="mb-3 text-sm font-bold uppercase text-slate-900">
            Condiciones de renta
          </p>
          <ul className="space-y-1.5 text-sm text-slate-600">
            {conditions.map((condition) => (
              <li key={condition} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0b477d]" />
                {condition}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Phone size={16} className="text-[#0b477d]" />
            ¿Dudas? Contáctanos: {WHATSAPP_DISPLAY}
            <MessageCircle size={16} className="text-[#25D366]" />
          </div>

          <div className="mt-10">
            <p className="text-sm font-bold uppercase text-slate-900">
              Acepto los términos y condiciones
            </p>
            <div className="mt-8 border-t border-slate-400 pt-2 text-sm text-slate-500">
              Firma del cliente
            </div>
            <p className="mt-4 text-sm text-slate-500">Fecha: ____ / ____ / ______</p>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-6 py-3 text-xs text-slate-300 print:px-4">
        Cancún, Quintana Roo, México · WhatsApp {WHATSAPP_DISPLAY}
      </footer>
      <div className="bg-black py-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
        Rentamivar · Renta automovilística
      </div>
    </article>
  );
}

function TrustBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0b477d] ring-1 ring-slate-200">
        {icon}
      </span>
      {label}
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-[#0b477d]">
      {text}
    </p>
  );
}

function BlankLine({ label }: { label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="shrink-0 font-semibold text-slate-500">{label}:</span>
      <span className="flex-1 border-b border-dotted border-slate-400">&nbsp;</span>
    </div>
  );
}

function SpecBadge({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[#0b477d]">{icon}</span>
      {label}
    </span>
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
        <div className="flex items-center gap-3 print:gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b477d] print:h-7 print:w-7 print:rounded-md">
            {icon}
          </span>
          <div className="min-w-0">
            <p className="break-words text-sm font-bold uppercase text-slate-950">
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
      <td className="break-words border-r border-slate-200 px-5 py-4 text-sm leading-6 text-slate-700 print:px-2 print:py-2 print:leading-5">
        {detail}
      </td>
      <td className="break-words px-5 py-4 text-right text-base font-bold tabular-nums text-slate-950 print:px-2 print:py-2 print:text-[10pt]">
        {amount}
      </td>
    </tr>
  );
}

function formatShortDate(value: string) {
  // quote.startDate/endDate are stored as UTC-midnight calendar dates;
  // format in UTC so the displayed day doesn't shift backward in timezones
  // behind UTC (e.g. America/Cancun).
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return `$${value.toLocaleString("es-MX")} MXN`;
}

function formatPriceMode(priceMode: string) {
  const labels: Record<string, string> = {
    NORMAL: "Precio normal",
    TEMPORADA_ALTA: "Temporada alta",
  };

  return labels[priceMode] ?? "Precio normal";
}