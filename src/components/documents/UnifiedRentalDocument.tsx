import Image from "next/image";
import CarDamageDiagram from "./CarDamageDiagram";
import { Rental } from "@/types/rental";

type Props = {
  rental: Rental;
};

const accessories = [
  "Gato",
  "Maneral",
  "Llave de ruedas",
  "Estuche de herramienta",
  "Señalamiento",
  "Llanta de refacción",
  "Extinguidor",
];

const mechanical = [
  "Claxon",
  "Tapón de aceite",
  "Tapón radiador",
  "Varilla de aceite",
  "Filtro de aire",
  "Batería",
];

const exterior = [
  "Unidad de luces",
  "Cuarto de luces",
  "Antena",
  "Espejo lateral izquierdo",
  "Espejo lateral derecho",
  "Parabrisas",
  "Ventanas",
  "Medallón",
  "Emblema",
  "Llantas",
  "Tapón de ruedas",
  "Limpiadores",
];

const interior = [
  "Tablero",
  "Calefacción / A/C",
  "Radio",
  "Bocinas",
  "Encendedor",
  "Espejo retrovisor",
  "Cinturones",
  "Botones interiores",
  "Manijas interiores",
  "Tapetes",
  "Vestiduras",
];

export default function UnifiedRentalDocument({ rental }: Props) {
  // An indefinida rental has no known return date/days until it's completed.
  // Once rental.daysCharged is set, treat it like a normal rental for
  // display — it now has a real return date and calculated total.
  const isOpenIndefinida =
    rental.rentalType === "INDEFINIDA" && !rental.daysCharged;
  const clientName = rental.client?.fullName ?? "________________________";
  const carName = rental.car
    ? `${rental.car.brand} ${rental.car.model} ${rental.car.year}`
    : "________________________";
  const phone = rental.client?.phone ?? "________________________";
  const idNumber = rental.client?.idNumber ?? "________________________";
  const plate = rental.car?.plate ?? "________________________";
  const depositAmount = rental.car?.deposit ? Number(rental.car.deposit) : 6000;
  const deposit = formatMoney(depositAmount);
  const totalWithDeposit = rental.totalPrice + depositAmount;
  const advancePayment = rental.advancePayment ?? 0;
  const remainingAfterAdvance = Math.max(totalWithDeposit - advancePayment, 0);

  return (
    <article className="print-document relative mx-auto max-w-[816px] overflow-hidden bg-white p-10 text-[12pt] leading-[1.35] text-black print:max-w-none print:overflow-visible print:p-0">
      <Image
        src="/documents/Logo.png"
        alt=""
        width={420}
        height={260}
        aria-hidden="true"
        priority
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] print:fixed print:opacity-[0.07]"
      />

      <div className="relative z-10">
        <h1 className="text-center text-[14pt] font-bold uppercase">
          Contrato de arrendamiento
        </h1>

        <p className="mt-4 text-right">
          Cancún, Quintana Roo a ____ de ______________ de 20____
        </p>

        <section className="mt-4">
          <h2 className="mb-2 font-bold uppercase">1. Datos generales</h2>
          <div className="grid grid-cols-2 gap-2 border border-black p-3">
            <Info label="Arrendatario" value={clientName} />
            <Info label="Teléfono" value={phone} />
            <Info label="Identificación" value={idNumber} />
            <Info label="Vehículo" value={carName} />
            <Info label="Placas" value={plate} />
            <Info label="Fecha de entrega" value={formatDate(rental.startDate)} />
            <Info
              label="Fecha de devolución"
              value={
                isOpenIndefinida
                  ? "Renta indefinida (sin fecha fija)"
                  : formatDate(rental.endDate)
              }
            />
            <Info
              label="Tarifa aplicada"
              value={
                rental.rentalType === "INDEFINIDA"
                  ? "Tarifa manual (renta indefinida)"
                  : formatPriceMode(rental.priceMode)
              }
            />
            <Info label="Desglose" value={getPriceBreakdown(rental)} />
            <Info
              label={isOpenIndefinida ? "Tarifa diaria" : "Monto de renta"}
              value={formatMoney(rental.totalPrice)}
            />
            <Info label="Depósito en garantía" value={deposit} />
            <Info
              label="Total (renta + depósito)"
              value={formatMoney(totalWithDeposit)}
            />
            <Info label="Anticipo recibido" value={formatMoney(advancePayment)} />
            <Info
              label="Total a cubrir después del anticipo"
              value={formatMoney(remainingAfterAdvance)}
            />
          </div>
        </section>

        <section className="mt-4">
          <h2 className="mb-2 font-bold uppercase">2. Declaraciones</h2>
          <p className="text-justify">
            El ARRENDADOR entrega en arrendamiento temporal al ARRENDATARIO el
            vehículo descrito anteriormente, quien manifiesta recibirlo en buen
            estado físico, mecánico y de funcionamiento, obligándose a
            devolverlo en las mismas condiciones en que lo recibe, salvo el
            desgaste natural por uso ordinario.
          </p>
          <p className="mt-2 text-justify">
            El ARRENDATARIO declara contar con la capacidad legal suficiente
            para celebrar el presente acuerdo y se obliga a utilizar el vehículo
            únicamente para fines permitidos por la ley.
          </p>
        </section>

        <section className="mt-4">
          <h2 className="mb-2 font-bold uppercase">
            3. Responsabilidad del arrendatario
          </h2>
          <p className="text-justify">
            Durante el tiempo que el vehículo se encuentre bajo su resguardo, el
            ARRENDATARIO asume todas las obligaciones civiles, penales,
            administrativas y económicas que se generen por el uso del vehículo.
          </p>
          <p className="mt-2 text-justify">
            En caso de accidente, daño, desperfecto, multa, infracción, robo,
            pérdida de documentos, accesorios o cualquier afectación al
            vehículo, el ARRENDATARIO se obliga a notificar de inmediato al
            ARRENDADOR y a cubrir los gastos, deducibles, reparaciones,
            sanciones o cargos que correspondan.
          </p>
        </section>

        <section className="mt-4 break-inside-avoid">
          <h2 className="mb-2 font-bold uppercase">
            4. Condiciones de entrega y devolución
          </h2>
          <ul className="list-disc space-y-0.5 pl-5">
            <li>El vehículo deberá devolverse en la fecha y hora acordadas.</li>
            <li>
              Si el vehículo se devuelve 30 minutos después, se podrá cobrar
              medio día de renta.
            </li>
            <li>
              Si el retraso es mayor a una hora, se podrá cobrar un día
              completo.
            </li>
            <li>
              El tanque de gasolina deberá entregarse con el mismo nivel en que
              fue recibido.
            </li>
            <li>
              El vehículo deberá entregarse limpio; en caso contrario, se
              cobrará el lavado por $200.00 MXN.
            </li>
            <li>
              El depósito podrá aplicarse para cubrir daños, faltantes,
              penalizaciones, limpieza, combustible o cualquier incumplimiento.
            </li>
            <li>
              El kilometraje será libre siempre y cuando el carro se encuentre
              dentro de Quintana Roo y Yucatán; de lo contrario, se les
              cobrará kilometraje extra.
            </li>
            <li>Los precios están sujetos a cambio sin previo aviso.</li>
            <li>
              En caso de que el vehículo sea devuelto con días de
              anticipación a la fecha pactada, únicamente se reembolsará el
              60% del importe correspondiente a los días no disfrutados.
            </li>
          </ul>
        </section>

        <section className="print-page-break mt-4">
          <div className="break-inside-avoid">
            <h2 className="mb-2 font-bold uppercase">
              5. Inventario y estado del vehículo
            </h2>
            <div className="grid grid-cols-2 gap-2 border border-black p-3">
              <Info label="Kilometraje de salida" value="________________" />
              <Info label="Kilometraje de regreso" value="________________" />
              <Info label="Gasolina de salida" value="________________" />
              <Info label="Gasolina de regreso" value="________________" />
            </div>
          </div>

          <div className="mt-4 border border-black p-4 print:mt-3 print:p-3">
            <h3 className="mb-3 text-center font-bold uppercase print:mb-2">
              Diagrama de daños del vehículo
            </h3>
            <div className="mx-auto max-w-sm print:max-w-[240px]">
              <CarDamageDiagram />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-6 print:mt-2 print:gap-x-6 print:gap-y-1 print:text-[9pt]">
              <Checklist title="Accesorios" items={accessories} />
              <Checklist title="Componentes mecánicos" items={mechanical} />
              <Checklist title="Exteriores" items={exterior} />
              <Checklist title="Interiores" items={interior} />
            </div>
          </div>
        </section>

        <section className="print-page-break mt-5">
          <h2 className="mb-2 font-bold uppercase">6. Cláusulas generales</h2>
          <p className="text-justify">
            El ARRENDATARIO no podrá subarrendar, ceder, prestar o permitir el
            uso del vehículo a terceros sin autorización del ARRENDADOR.
          </p>
          <p className="mt-2 text-justify">
            Queda prohibido utilizar el vehículo para actividades ilícitas,
            transportar sustancias peligrosas, conducir bajo los efectos del
            alcohol, drogas, estupefacientes o cualquier sustancia que altere la
            capacidad de manejo.
          </p>
          <p className="mt-2 text-justify">
            El ARRENDATARIO deberá respetar las leyes y reglamentos de tránsito
            municipales, estatales y federales. Cualquier multa o sanción
            generada durante el periodo de arrendamiento será responsabilidad
            del ARRENDATARIO.
          </p>
          <p className="mt-2 text-justify">
            Las partes reconocen que en el presente documento no existe dolo,
            violencia, mala fe o engaño, por lo que firman de conformidad.
          </p>
        </section>

        <section className="mt-12">
          <div className="grid grid-cols-2 gap-10 text-center">
            <Signature label="EL ARRENDADOR" />
            <Signature label="EL ARRENDATARIO" name={clientName} />
            <Signature label="TESTIGO 1" />
            <Signature label="TESTIGO 2" />
          </div>
        </section>

        <p className="mt-10 border-t border-slate-300 pt-2 text-center text-[9px] text-slate-500">
          Este contrato fue generado automáticamente por el sistema de la
          empresa Rentamivar para control administrativo interno.
        </p>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-bold">{label}: </span>
      <span>{value}</span>
    </div>
  );
}

function formatDate(value: string | null) {
  return value ? value.slice(0, 10) : "-";
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

function getPriceBreakdown(rental: Rental) {
  if (rental.rentalType === "INDEFINIDA" && !rental.daysCharged) {
    return `Tarifa manual acordada: ${formatMoney(rental.dailyRateApplied)} por día`;
  }

  const days = rental.daysCharged || 1;
  const rate = rental.dailyRateApplied || rental.totalPrice / days;

  return `${days} ${days === 1 ? "día" : "días"} x ${formatMoney(rate)} = ${formatMoney(rental.totalPrice)}`;
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="break-inside-avoid">
      <h3 className="mb-2 border-b border-black text-center font-bold uppercase">
        {title}
      </h3>
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center justify-between border-b border-dotted border-slate-400"
          >
            <span>{item}</span>
            <span>[ ]</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Signature({ label, name }: { label: string; name?: string }) {
  return (
    <div className="mt-10 break-inside-avoid">
      <div className="border-t border-black pt-2 font-bold">{label}</div>
      {name && <p className="mt-1">{name}</p>}
    </div>
  );
}
