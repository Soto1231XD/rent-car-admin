type Props = {
  rental: {
    id: number;
    clientName: string;
    carName: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    status: string;
  };
};

export default function RentalTicket({ rental }: Props) {
  return (
    <article className="mx-auto max-w-[380px] bg-white p-6 text-[12px] text-black print:p-4">
      <div className="text-center">
        <h1 className="text-lg font-bold uppercase">Rentamivar</h1>
        <p className="text-xs">Ticket de renta de vehículo</p>
        <p className="mt-2 text-xs">Folio: #{rental.id}</p>
      </div>

      <div className="my-4 border-t border-dashed border-black" />

      <section className="space-y-2">
        <Row label="Cliente" value={rental.clientName} />
        <Row label="Vehículo" value={rental.carName} />
        <Row label="Fecha entrega" value={rental.startDate} />
        <Row label="Fecha devolución" value={rental.endDate} />
        <Row label="Estado" value={rental.status} />
      </section>

      <div className="my-4 border-t border-dashed border-black" />

      <section className="space-y-2">
        <Row
          label="Total"
          value={`$${rental.totalPrice.toLocaleString("es-MX")} MXN`}
          bold
        />
        <Row label="Pagado" value="$0 MXN" />
        <Row
          label="Saldo pendiente"
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
        <div className="border-t border-black pt-2">
          Firma de recibido
        </div>
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