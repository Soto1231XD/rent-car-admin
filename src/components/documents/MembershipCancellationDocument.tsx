import Image from "next/image";
import { Membership, MembershipPayment } from "@/types/membership";
import { formatCurrency } from "@/lib/format-currency";
import { formatMembershipNumber } from "@/lib/membership-number";

type Props = {
  membership: Membership;
};

const MEMBERSHIP_MONTHLY_FEE = 500;

export default function MembershipCancellationDocument({ membership }: Props) {
  const client = membership.client;
  const clientName = client?.fullName ?? "________________________";
  const idNumber = client?.idNumber ?? "________________________";
  const address = client?.address ?? "________________________";
  const phone = client?.phone ?? "________________________";
  const email = client?.email ?? "________________________";
  const folio = formatMembershipNumber(membership.membershipNumber);

  const lastApprovedPayment = getLastApprovedPayment(membership.payments);

  // Días: "acumulados registrados" = todo lo que la membresía ha generado a
  // la fecha (lo ya usado + lo que sigue disponible); "utilizados" es el
  // histórico de canjes (lifetimeRedeemedDays, informativo); "saldo
  // pendiente" es lo que de verdad le queda disponible hoy (availableDays).
  // Mismo criterio que MembershipDaysCard / daysSummary en el resto del CRM.
  const availableDays = membership.daysSummary?.availableDays ?? 0;
  const usedDays = membership.daysSummary?.lifetimeRedeemedDays ?? 0;
  const accumulatedDays = availableDays + usedDays;

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
          Rentamivar Premium
        </h1>
        <p className="text-center text-[11pt] font-semibold uppercase">
          Convenio de cancelación voluntaria de membresía
        </p>

        <div className="mt-4">
          <Info label="Lugar y fecha" value="________________________" />
          <Info label="Folio" value={folio} />
        </div>

        <section className="mt-4">
          <h2 className="mb-2 font-bold uppercase">I. Datos de las partes</h2>
          <div className="grid grid-cols-2 gap-2 border border-black p-3">
            <Info label="Rentamivar, representada por" value="________________________" />
            <Info label="Cargo" value="________________________" />
            <Info label="El cliente — Nombre completo" value={clientName} />
            <Info label="Identificación oficial" value={idNumber} />
            <Info label="Domicilio" value={address} />
            <Info label="Teléfono" value={phone} />
            <Info label="Correo" value={email} />
            <Info label="Folio de membresía" value={folio} />
            <Info label="Fecha de contratación" value={formatDate(membership.startDate)} />
          </div>
          <p className="mt-2 text-justify">
            Ambas partes manifiestan su voluntad de formalizar la cancelación voluntaria de la
            membresía RENTAMIVAR PREMIUM conforme a las siguientes declaraciones y cláusulas.
          </p>
        </section>

        <section className="mt-4">
          <h2 className="mb-2 font-bold uppercase">II. Declaraciones</h2>
          <p className="text-justify">
            <strong>PRIMERA.</strong> EL CLIENTE manifiesta que contrató voluntariamente la
            membresía RENTAMIVAR PREMIUM y que, por decisión propia, desea dar por terminada su
            participación en el programa.
          </p>
          <p className="mt-2 text-justify">
            <strong>SEGUNDA.</strong> EL CLIENTE declara que solicita la cancelación de manera
            libre y voluntaria, sin que ello implique renunciar a derechos que legalmente le
            correspondan.
          </p>
          <p className="mt-2 text-justify">
            <strong>TERCERA.</strong> Ambas partes reconocen que la membresía se encuentra sujeta
            a los términos y condiciones aceptados al momento de su contratación, los cuales
            servirán como referencia para determinar el estado de la membresía y los beneficios
            pendientes.
          </p>
        </section>

        <section className="mt-4">
          <h2 className="mb-2 font-bold uppercase">III. Cláusulas</h2>

          <p className="text-justify">
            <strong>PRIMERA. OBJETO.</strong> El presente documento tiene por objeto dejar
            constancia formal de la solicitud y tramitación de la cancelación voluntaria de la
            membresía RENTAMIVAR PREMIUM por decisión de EL CLIENTE.
          </p>

          <p className="mt-2 text-justify">
            <strong>SEGUNDA. SOLICITUD Y FECHA EFECTIVA.</strong> EL CLIENTE solicita expresamente
            la cancelación de su membresía.
          </p>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <Info label="Fecha de solicitud" value="________________________" />
            <Info label="Fecha efectiva de cancelación" value="________________________" />
          </div>
          <p className="mt-2 text-justify">
            La solicitud deberá presentarse por escrito al correo oficial
            Admin.rentamivar@gmail.com. RENTAMIVAR dejará constancia de su recepción y comunicará
            a EL CLIENTE la fecha efectiva de cancelación. La baja se tramitará conforme a los
            términos de la membresía y las disposiciones aplicables.
          </p>

          <p className="mt-3 text-justify">
            <strong>TERCERA. ESTADO DE PAGOS.</strong> Las partes registran la siguiente
            información al formalizar la cancelación:
          </p>
          <div className="mt-1 grid grid-cols-2 gap-2 border border-black p-3">
            <Info label="Cuota mensual" value={formatCurrency(MEMBERSHIP_MONTHLY_FEE)} />
            <Info
              label="Última mensualidad cubierta"
              value={
                lastApprovedPayment?.periodEnd
                  ? formatDate(lastApprovedPayment.periodEnd)
                  : "________________________"
              }
            />
            <Info
              label="Fecha del último pago"
              value={
                lastApprovedPayment?.createdAt
                  ? formatDate(lastApprovedPayment.createdAt)
                  : "________________________"
              }
            />
            <Info label="Observaciones" value="________________________" />
          </div>

          <p className="mt-3 text-justify">
            <strong>CUARTA. DÍAS DE RENTA ACUMULADOS.</strong> Las partes hacen constar el saldo
            asociado a la membresía:
          </p>
          <div className="mt-1 grid grid-cols-3 gap-2 border border-black p-3">
            <Info label="Días acumulados registrados" value={`${accumulatedDays} días`} />
            <Info label="Días de renta utilizados" value={`${usedDays} días`} />
            <Info label="Saldo de días pendiente" value={`${availableDays} días`} />
          </div>
          <p className="mt-1">
            <span className="font-bold">Observaciones o aclaraciones: </span>
            <span>________________________</span>
          </p>
          <p className="mt-2 text-justify">
            El saldo quedará sujeto a revisión y resolución conforme a los términos y condiciones
            de RENTAMIVAR PREMIUM aceptados por EL CLIENTE y a las disposiciones aplicables al
            momento de la cancelación. La firma de este convenio no implica por sí misma que los
            días pendientes se pierdan, se transfieran, se conviertan en dinero o sean
            reembolsables. Cualquier determinación sobre su tratamiento deberá ajustarse a los
            términos aplicables y, cuando corresponda, quedar documentada por escrito.
          </p>

          <p className="mt-3 text-justify print-page-break">
            <strong>QUINTA. BENEFICIOS DE LA MEMBRESÍA.</strong> A partir de la fecha efectiva de
            cancelación, EL CLIENTE dejará de tener acceso a los beneficios vinculados a la
            membresía cancelada, de acuerdo con los términos y condiciones aplicables. La
            cancelación no afectará las obligaciones relacionadas con rentas previamente
            formalizadas ni las responsabilidades vinculadas a contratos independientes.
          </p>

          <p className="mt-2 text-justify">
            <strong>SEXTA. CONSTANCIA DE CANCELACIÓN.</strong> Una vez procesada la solicitud,
            RENTAMIVAR proporcionará a EL CLIENTE una constancia de cancelación o copia del
            presente convenio formalizado, indicando la fecha efectiva de baja. La firma no deberá
            interpretarse como finiquito general ni como renuncia a derechos que legalmente
            correspondan a cualquiera de las partes.
          </p>

          <p className="mt-2 text-justify">
            <strong>SÉPTIMA. ACEPTACIÓN.</strong> Leído el presente convenio y comprendido su
            alcance, ambas partes manifiestan su conformidad con los datos registrados y firman
            para dejar constancia de la solicitud de cancelación voluntaria y del estado de la
            membresía a la fecha indicada. Cada parte podrá conservar una copia firmada.
          </p>
        </section>

        <section className="mt-6 break-inside-avoid">
          <h2 className="mb-2 font-bold uppercase">IV. Firmas de conformidad</h2>
          <div className="grid grid-cols-2 gap-10 text-center">
            <Signature label="EL CLIENTE — TITULAR DE LA MEMBRESÍA" name={clientName} />
            <Signature label="POR RENTAMIVAR" />
            <Signature label="TESTIGO (OPCIONAL)" />
          </div>
        </section>

        <p className="mt-10 border-t border-slate-300 pt-2 text-center text-[9px] text-slate-500">
          RENTAMIVAR PREMIUM · Constancia formal de cancelación de membresía ·
          Admin.rentamivar@gmail.com
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

function getLastApprovedPayment(
  payments?: MembershipPayment[]
): MembershipPayment | null {
  if (!payments || payments.length === 0) {
    return null;
  }

  const approved = payments.filter((payment) => payment.status === "approved");
  if (approved.length === 0) {
    return null;
  }

  return approved.reduce((latest, payment) =>
    new Date(payment.createdAt ?? 0) > new Date(latest.createdAt ?? 0)
      ? payment
      : latest
  );
}

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : "________________________";
}

function Signature({ label, name }: { label: string; name?: string }) {
  return (
    <div className="mt-10 break-inside-avoid">
      <div className="border-t border-black pt-2 font-bold">{label}</div>
      {name && <p className="mt-1">{name}</p>}
      <p className="mt-6 text-sm">Fecha: ________________________</p>
    </div>
  );
}
