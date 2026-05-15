import { Rental } from "@/types/rental";

type Props = {
  rental: Rental;
};

export default function RentalTicket({ rental }: Props) {
  const clientName = rental.client?.fullName ?? "Cliente no disponible";
  const carName = rental.car
    ? `${rental.car.brand} ${rental.car.model} ${rental.car.year}`
    : "Vehículo no disponible";
  const priceBreakdown = getPriceBreakdown(rental);

  return (
    <article className="mx-auto max-w-[380px] bg-white p-6 text-[12px] text-black print:p-4">
      <div className="text-center">
        <h1 className="text-lg font-bold uppercase">Rentamivar</h1>
        <p className="text-xs">Ticket de renta de vehículo</p>
        <p className="mt-2 text-xs">Folio: #{rental.id.slice(0, 8)}</p>
      </div>

      <div className="my-4 border-t border-dashed border-black" />

      <section className="space-y-2">
        <Row label="Cliente" value={clientName} />
        <Row label="Vehículo" value={carName} />
        <Row label="Fecha entrega" value={formatDate(rental.startDate)} />
        <Row label="Fecha devolución" value={formatDate(rental.endDate)} />
        <Row label="Estado" value={formatStatus(rental.status)} />
      </section>

      <div className="my-4 border-t border-dashed border-black" />

      <section className="space-y-2">
        <Row label="Tarifa" value={formatPriceMode(rental.priceMode)} />
        <Row label="Desglose" value={priceBreakdown} />
        <Row
          label="Total"
          value={`$${rental.totalPrice.toLocaleString("es-MX")} MXN`}
          bold
        />
      </section>

      <div className="my-4 border-t border-dashed border-black" />

      <p className="text-center text-xs">
        Gracias por su preferencia.
        <br />
        Conserve este ticket como comprobante.
      </p>

      <div className="mt-6 text-center">
        <div className="border-t border-black pt-2">Firma de recibido</div>
      </div>
    </article>
  );
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-medium">{label}:</span>
      <span className={`text-right ${bold ? "font-bold" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    RESERVACION: "Reservación",
    ACTIVO: "Activa",
    COMPLETADO: "Completada",
    CANCELADO: "Cancelada",
  };

  return labels[status] ?? status;
}

function formatPriceMode(priceMode: string) {
  const labels: Record<string, string> = {
    NORMAL: "Precio normal",
    TEMPORADA_ALTA: "Temporada alta",
  };

  return labels[priceMode] ?? "Precio normal";
}

function getPriceBreakdown(rental: Rental) {
  const days = rental.daysCharged || 1;
  const rate = rental.dailyRateApplied || rental.totalPrice / days;

  return `${days} ${days === 1 ? "día" : "días"} x $${rate.toLocaleString(
    "es-MX"
  )} MXN`;
}
