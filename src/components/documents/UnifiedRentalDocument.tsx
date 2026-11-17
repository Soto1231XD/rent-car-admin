import { ReactNode } from "react";
import Image from "next/image";
import CarDamageDiagram from "./CarDamageDiagram";
import { Rental } from "@/types/rental";
import { formatCarLabel } from "@/lib/car-label";
import { formatCurrency as formatMoney } from "@/lib/format-currency";

// Identidad legal de "EL ARRENDADOR" para el contrato -- antes el documento
// nunca la mostraba, solo hablaba de "EL ARRENDADOR" en abstracto sin RFC ni
// datos de contacto reales, lo que hacía que no se viera como un contrato
// formal. Se usa el nombre comercial (no el nombre personal del titular del
// RFC) junto con el RFC real tomado de la Constancia de Situación Fiscal
// vigente; el resto ya se usa igual en el resto del sitio.
const LESSOR_NAME = "RENTAMIVAR";
const LESSOR_RFC = "MASC950912JU3";
const LESSOR_ADDRESS = "SM 97, Mz 5, Lte 20, Calle Pustunich, C.P. 77530, Cancún, Q. Roo";
const LESSOR_PHONE = "+52 998 399 8112";

type Props = {
  rental: Rental;
  // Códigos QR (como data URL, generados server-side con la librería
  // "qrcode") hacia las redes de la empresa. Un link de texto solo sirve si
  // alguien ve el PDF en pantalla; en un contrato que a veces se firma e
  // imprime en papel, el QR es lo único que funciona siempre.
  socialQrCodes?: {
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
  };
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

export default function UnifiedRentalDocument({ rental, socialQrCodes }: Props) {
  // An indefinida rental has no known return date/days until it's completed.
  // Once rental.daysCharged is set, treat it like a normal rental for
  // display — it now has a real return date and calculated total.
  const isOpenIndefinida =
    rental.rentalType === "INDEFINIDA" && !rental.daysCharged;
  const clientName = rental.client?.fullName ?? "________________________";
  const carName = rental.car
    ? formatCarLabel(rental.car)
    : "________________________";
  const phone = rental.client?.phone ?? "________________________";
  const idNumber = rental.client?.idNumber ?? "________________________";
  const plate = rental.car?.plate ?? "________________________";
  // El depósito real de esta renta (puede diferir del depósito actual del
  // auto si el staff lo ajustó al crear/editar la renta, o si el precio
  // del auto cambió después). Solo se recurre al depósito del auto, y
  // luego al valor fijo, para rentas viejas que nunca lo guardaron.
  const depositAmount =
    rental.depositAmount != null
      ? Number(rental.depositAmount)
      : rental.car?.deposit
        ? Number(rental.car.deposit)
        : 6000;
  const deposit = formatMoney(depositAmount);
  const totalWithDeposit = rental.totalPrice + depositAmount;
  const advancePayment = rental.advancePayment ?? 0;
  const remainingAfterAdvance = Math.max(totalWithDeposit - advancePayment, 0);
  // No hay folio de contrato como tal en el backend -- se deriva un número
  // corto y legible del id de la renta, solo para que el documento se vea
  // numerado/trazable, sin necesitar un campo ni migración nuevos.
  const contractNumber = rental.id.slice(-8).toUpperCase();
  // El "Kilometraje de salida" se jala del control de kilometraje del auto
  // (Car.currentMileage): cada vez que se completa una renta, ese campo se
  // actualiza con el kilometraje de regreso, así que siempre refleja el
  // último kilometraje conocido -- el que le toca de salida a la siguiente
  // renta. El de regreso sigue en blanco porque se llena hasta que esta
  // renta se complete.
  const departureMileage =
    rental.car?.currentMileage != null
      ? `${rental.car.currentMileage.toLocaleString("es-MX")} km`
      : "________________";

  return (
    <article
      className="print-document relative mx-auto max-w-[816px] overflow-hidden bg-white p-10 text-[12pt] leading-[1.35] text-black print:max-w-none print:overflow-visible print:p-0"
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
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
        <section className="-mx-10 -mt-10 mb-6 break-inside-avoid print:mx-0 print:mt-0">
          {/* Mismo patrón que el banner de "Asistencia 24 horas": un solo
              SVG con forma y texto incluidos, para que se vea idéntico en
              pantalla y en el PDF exportado. */}
          <svg
            viewBox="0 0 820 190"
            width="100%"
            style={{ display: "block" }}
            role="img"
            aria-label="Rentamivar - Contrato de renta"
          >
            <polygon
              points="0,0 820,0 820,170 410,150 0,170"
              fill="#0b477d"
            />
            <rect x="340" y="58" width="140" height="3" fill="#ffffff" />
            <text
              x="410"
              y="50"
              textAnchor="middle"
              fontFamily="Helvetica, Arial, sans-serif"
              fontSize="32"
              fontWeight="bold"
              fontStyle="italic"
              fill="#ffffff"
            >
              RENTAMIVAR
            </text>
            <text
              x="410"
              y="82"
              textAnchor="middle"
              fontFamily="Helvetica, Arial, sans-serif"
              fontSize="17"
              fontWeight="bold"
              fill="#ffffff"
            >
              Contrato de renta
            </text>
            <text
              x="410"
              y="108"
              textAnchor="middle"
              fontFamily="Helvetica, Arial, sans-serif"
              fontSize="11"
              fill="#ffffff"
            >
              Estimado cliente, lea cuidadosamente su contrato y
            </text>
            <text
              x="410"
              y="124"
              textAnchor="middle"
              fontFamily="Helvetica, Arial, sans-serif"
              fontSize="11"
              fill="#ffffff"
            >
              consérvelo hasta el final de su renta.
            </text>
          </svg>
        </section>

        <h1 className="text-center text-[14pt] font-bold uppercase">
          Contrato de arrendamiento
        </h1>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10pt]">
          <p className="font-bold uppercase tracking-wide text-[#0b477d]">
            Contrato No. {contractNumber}
          </p>
          <p>Cancún, Quintana Roo a ____ de ______________ de 20____</p>
        </div>

        <p className="mt-4 text-justify">
          Contrato de arrendamiento de vehículo que celebran, por una parte{" "}
          <b>{LESSOR_NAME}</b>, con <b>RFC {LESSOR_RFC}</b>, con domicilio en{" "}
          {LESSOR_ADDRESS} y teléfono {LESSOR_PHONE}, a quien en lo sucesivo se
          le denominará <b>&quot;EL ARRENDADOR&quot;</b>; y por la otra parte
          quien se identifica en los datos generales de este documento, a
          quien en lo sucesivo se le denominará <b>&quot;EL ARRENDATARIO&quot;</b>,
          al tenor de las siguientes declaraciones y cláusulas.
        </p>

        <section className="mt-4">
          <SectionHeading number={1} title="Datos generales" />
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-300 p-3">
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
            {!!rental.membershipRedeemedDays && (
              <Info
                label="Días de membresía aplicados"
                value={`${rental.membershipRedeemedDays} (tarifa de canje, incluida en el monto de renta)`}
              />
            )}
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
            {rental.deliveryLocation && (
              <Info
                label="Punto de entrega"
                value={formatDeliveryPoint(rental.deliveryLocation, rental.deliveryFee)}
              />
            )}
            {rental.returnLocation && (
              <Info
                label="Punto de devolución"
                value={formatDeliveryPoint(rental.returnLocation, rental.returnFee)}
              />
            )}
            {!!rental.extraFuelFee && (
              <Info label="Gasolina extra" value={formatMoney(rental.extraFuelFee)} />
            )}
          </div>
        </section>

        <section className="mt-4">
          <SectionHeading number={2} title="Declaraciones" />
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
          <SectionHeading number={3} title="Responsabilidad del arrendatario" />
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
          <SectionHeading number={4} title="Condiciones de entrega y devolución" />
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
            <SectionHeading number={5} title="Inventario y estado del vehículo" />
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-300 p-3">
              <Info label="Kilometraje de salida" value={departureMileage} />
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

          <p className="mt-4 text-justify">
            Declaro que el vehículo ha sido revisado en mi presencia en
            cuanto a sus condiciones físicas, accesorios y niveles de
            gasolina, aceptando que no cuenta con mayores daños o faltantes
            que los señalados en el diagrama de daños anexo.
          </p>
        </section>

        <section className="print-page-break mt-5">
          <SectionHeading number={6} title="Cláusulas generales" />
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
            <Signature label="EL ARRENDADOR" name={LESSOR_NAME} />
            <Signature label="EL ARRENDATARIO" name={clientName} />
          </div>
        </section>

        <section className="mt-10 break-inside-avoid">
          {/* Todo el banner (forma + texto) se dibuja dentro de UN solo SVG.
              El intento anterior combinaba CSS Grid + posicionamiento
              absoluto + un SVG con "preserveAspectRatio=none" estirado por
              porcentaje del alto/ancho del contenedor -- esa combinación no
              se mide igual en el motor de "Guardar como PDF" de Chrome que
              en pantalla, y el corte diagonal salía más ancho/torcido en el
              PDF. Un solo SVG con su propio viewBox (forma y texto
              incluidos) es un único gráfico vectorial que el PDF reproduce
              igual que la pantalla, sin nada que CSS/Grid pueda calcular
              distinto entre los dos. */}
          <svg
            viewBox="0 0 820 110"
            width="100%"
            style={{ display: "block" }}
            role="img"
            aria-label="Asistencia las 24 horas"
          >
            <rect width="820" height="110" fill="#eef6fc" />
            <polygon points="0,0 400,0 320,110 0,110" fill="#0b477d" />

            <circle
              cx="55"
              cy="55"
              r="26"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
            />
            <text
              x="55"
              y="51"
              textAnchor="middle"
              fontFamily="Helvetica, Arial, sans-serif"
              fontSize="13"
              fontWeight="bold"
              fill="#ffffff"
            >
              24
            </text>
            <text
              x="55"
              y="65"
              textAnchor="middle"
              fontFamily="Helvetica, Arial, sans-serif"
              fontSize="10"
              fontWeight="bold"
              fill="#ffffff"
            >
              hrs
            </text>

            <text
              x="100"
              y="48"
              textAnchor="start"
              fontFamily="Helvetica, Arial, sans-serif"
              fontSize="15"
              fontWeight="bold"
              fill="#ffffff"
            >
              ASISTENCIA LAS 24 HORAS
            </text>
            <text
              x="100"
              y="68"
              textAnchor="start"
              fontFamily="Helvetica, Arial, sans-serif"
              fontSize="13"
              fill="#ffffff"
            >
              WhatsApp: {LESSOR_PHONE}
            </text>

            <text
              x="430"
              y="50"
              textAnchor="start"
              fontFamily="Helvetica, Arial, sans-serif"
              fontSize="17"
              fontWeight="bold"
              fill="#0b477d"
            >
              Gracias por elegir RENTAMIVAR
            </text>
            <text
              x="430"
              y="74"
              textAnchor="start"
              fontFamily="Helvetica, Arial, sans-serif"
              fontSize="17"
              fontWeight="bold"
              fill="#0b477d"
            >
              ¡Buen viaje!
            </text>
          </svg>
        </section>

        {socialQrCodes && (
          <section className="mt-4 flex justify-center gap-8 break-inside-avoid">
            <SocialQr
              label="Facebook"
              qrDataUrl={socialQrCodes.facebook}
              icon={<FacebookIcon className="h-5 w-5 text-[#1877F2]" />}
            />
            <SocialQr
              label="Instagram"
              qrDataUrl={socialQrCodes.instagram}
              icon={<InstagramIcon className="h-5 w-5 text-[#E1306C]" />}
            />
            <SocialQr
              label="TikTok"
              qrDataUrl={socialQrCodes.tiktok}
              icon={<TikTokIcon className="h-5 w-5 text-slate-900" />}
            />
          </section>
        )}

        <p className="mt-3 border-t border-slate-300 pt-2 text-center text-[9px] text-slate-500">
          RENTAMIVAR · RFC {LESSOR_RFC} · Tel. {LESSOR_PHONE} · Facebook /
          Instagram / TikTok: @rentamivar
          <br />
          Este contrato fue generado automáticamente por el sistema de la
          empresa Rentamivar para control administrativo interno.
        </p>
      </div>
    </article>
  );
}

function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#0b477d] text-[11px] font-bold text-white">
        {number}
      </span>
      <h2 className="font-bold uppercase tracking-wide text-slate-900">
        {title}
      </h2>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f8fafc] px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-wide text-[#0b477d]">
        {label}
      </p>
      <p className="mt-0.5 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatDeliveryPoint(location: string, fee?: number | null) {
  return fee && fee > 0
    ? `${location} (cargo adicional: ${formatMoney(fee)})`
    : `${location} (sin costo adicional)`;
}

function formatDate(value: string | null) {
  return value ? value.slice(0, 10) : "-";
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
    <div className="break-inside-avoid rounded-xl border border-slate-300 p-4 pt-14">
      <div className="border-t border-slate-400 pt-2 text-xs font-bold uppercase tracking-wide text-[#0b477d]">
        {label}
      </div>
      {name && <p className="mt-1 text-sm font-semibold text-slate-700">{name}</p>}
    </div>
  );
}

function SocialQr({
  label,
  qrDataUrl,
  icon,
}: {
  label: string;
  qrDataUrl: string | null;
  icon: ReactNode;
}) {
  if (!qrDataUrl) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-28 w-28">
        {/* El QR se genera con errorCorrectionLevel "H" (tolera hasta ~30%
            de obstrucción) justamente para poder taparle el centro con el
            logo sin que deje de escanear. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt={`Código QR de ${label}`} className="h-28 w-28" />
        <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow">
          {icon}
        </span>
      </div>
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </p>
    </div>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22.675 0h-21.35C.594 0 0 .593 0 1.325v21.351C0 23.406.594 24 1.325 24h11.494v-9.294H9.691v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.098 2.795.142v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.115c.73 0 1.324-.594 1.324-1.325V1.325C24 .593 23.406 0 22.675 0z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.204-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.011-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.708 0h-3.516v16.078c0 1.734-1.396 3.152-3.13 3.152a3.135 3.135 0 0 1-3.13-3.152 3.135 3.135 0 0 1 3.13-3.152c.323 0 .63.055.923.144V9.4a6.756 6.756 0 0 0-.923-.064C6.31 9.336 3 12.646 3 16.898 3 21.15 6.311 24.46 10.062 24.46c3.751 0 7.062-3.31 7.062-7.562v-8.19a9.673 9.673 0 0 0 5.629 1.802V6.996a6.13 6.13 0 0 1-3.396-1.031A6.146 6.146 0 0 1 16.708 0z" />
    </svg>
  );
}
