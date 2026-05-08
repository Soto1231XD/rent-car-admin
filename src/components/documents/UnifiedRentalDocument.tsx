import CarDamageDiagram from "./CarDamageDiagram";

type Props = {
  rental: {
    id: number;
    clientName: string;
    carName: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
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

export default function UnifiedRentalDocument({ rental }: Props) {
  return (
    <article className="mx-auto min-h-screen max-w-[816px] bg-white p-10 text-[11px] leading-5 text-black print:p-8">
      <h1 className="text-center text-sm font-bold uppercase">
        Contrato de arrendamiento, carta responsiva e inventario vehicular
      </h1>

      <p className="mt-4 text-right">
        Cancún, Quintana Roo a ____ de ______________ de 20____
      </p>

      <section className="mt-5">
        <h2 className="mb-2 font-bold uppercase">1. Datos generales</h2>

        <div className="grid grid-cols-2 gap-2 border border-black p-3">
          <Info label="Arrendatario" value={rental.clientName} />
          <Info label="Teléfono" value="________________________" />
          <Info label="Identificación" value="________________________" />
          <Info label="Domicilio" value="________________________" />
          <Info label="Vehículo" value={rental.carName} />
          <Info label="Placas" value="________________________" />
          <Info label="Fecha de entrega" value={rental.startDate} />
          <Info label="Fecha de devolución" value={rental.endDate} />
          <Info
            label="Monto de renta"
            value={`$${rental.totalPrice.toLocaleString("es-MX")} MXN`}
          />
          <Info label="Depósito en garantía" value="$6,000 MXN" />
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 font-bold uppercase">2. Declaraciones</h2>

        <p className="text-justify">
          El ARRENDADOR entrega en arrendamiento temporal al ARRENDATARIO el
          vehículo descrito anteriormente, quien manifiesta recibirlo en buen
          estado físico, mecánico y de funcionamiento, obligándose a devolverlo
          en las mismas condiciones en que lo recibe, salvo el desgaste natural
          por uso ordinario.
        </p>

        <p className="mt-2 text-justify">
          El ARRENDATARIO declara contar con la capacidad legal suficiente para
          celebrar el presente acuerdo y se obliga a utilizar el vehículo
          únicamente para fines permitidos por la ley.
        </p>
      </section>

      <section className="mt-5">
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
          pérdida de documentos, accesorios o cualquier afectación al vehículo,
          el ARRENDATARIO se obliga a notificar de inmediato al ARRENDADOR y a
          cubrir los gastos, deducibles, reparaciones, sanciones o cargos que
          correspondan.
        </p>

        <p className="mt-2 text-justify">
          Si el vehículo queda detenido, retenido, en reparación o fuera de
          operación por causa atribuible al ARRENDATARIO, este deberá cubrir una
          penalización de $1,000.00 MXN diarios, además de los gastos derivados
          del incidente.
        </p>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 font-bold uppercase">
          4. Condiciones de entrega y devolución
        </h2>

        <ul className="list-disc space-y-1 pl-5">
          <li>
            El vehículo deberá devolverse en la fecha y hora acordadas.
          </li>
          <li>
            Si el vehículo se devuelve 30 minutos después, se podrá cobrar medio
            día de renta.
          </li>
          <li>
            Si el retraso es mayor a una hora, se podrá cobrar un día completo.
          </li>
          <li>
            El tanque de gasolina deberá entregarse con el mismo nivel en que fue
            recibido.
          </li>
          <li>
            El vehículo deberá entregarse limpio; en caso contrario, se les cobrara
            el  lavado por $180.00 MXN.
          </li>
          <li>
            El depósito podrá aplicarse para cubrir daños, faltantes,
            penalizaciones, limpieza, combustible o cualquier incumplimiento.
          </li>
        </ul>
      </section>

      <section className="mt-5 break-before-page">
        <h2 className="mb-2 font-bold uppercase">
          5. Inventario y estado del vehículo
        </h2>

        <div className="grid grid-cols-2 gap-2 border border-black p-3">
          <Info label="Kilometraje de salida" value="________________" />
          <Info label="Kilometraje de regreso" value="________________" />
          <Info label="Gasolina de salida" value="________________" />
          <Info label="Gasolina de regreso" value="________________" />
        </div>

        {/* DIAGRAMA DEL CARRO */}
  <div className="mt-5 border border-black p-4">
    <h3 className="mb-3 text-center font-bold uppercase">
      Diagrama de daños del vehículo
    </h3>

    <div className="mx-auto max-w-sm">
      <CarDamageDiagram />
    </div>

    <div className="mt-4 grid grid-cols-2 gap-6">
      <Checklist title="Accesorios" items={accessories} />
      <Checklist title="Componentes mecánicos" items={mechanical} />
      <Checklist title="Exteriores" items={exterior} />
      <Checklist title="Interiores" items={interior} />
    </div>

    <div className="mt-5">
      <h3 className="mb-2 font-bold uppercase">Observaciones</h3>
      <div className="h-28 border border-black p-2">
        ________________________________________________________________
        <br />
        ________________________________________________________________
        <br />
        ________________________________________________________________
        <br />
        ________________________________________________________________
      </div>
    </div>
  </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 font-bold uppercase">6. Cláusulas generales</h2>

        <p className="text-justify">
          El ARRENDATARIO no podrá subarrendar, ceder, prestar o permitir el uso
          del vehículo a terceros sin autorización del ARRENDADOR.
        </p>

        <p className="mt-2 text-justify">
          Queda prohibido utilizar el vehículo para actividades ilícitas,
          transportar sustancias peligrosas, conducir bajo los efectos del
          alcohol, drogas, estupefacientes o cualquier sustancia que altere la
          capacidad de manejo.
        </p>

        <p className="mt-2 text-justify">
          El ARRENDATARIO deberá respetar las leyes y reglamentos de tránsito
          municipales, estatales y federales. Cualquier multa o sanción generada
          durante el periodo de arrendamiento será responsabilidad del
          ARRENDATARIO.
        </p>

        <p className="mt-2 text-justify">
          En caso de robo o siniestro, el ARRENDATARIO deberá avisar de
          inmediato al ARRENDADOR y a las autoridades competentes.
        </p>

        <p className="mt-2 text-justify">
          Las partes reconocen que en el presente documento no existe dolo,
          violencia, mala fe o engaño, por lo que firman de conformidad.
        </p>
      </section>

      <section className="mt-12">
        <div className="grid grid-cols-2 gap-10 text-center">
          <Signature label="EL ARRENDADOR" />
          <Signature label="EL ARRENDATARIO" name={rental.clientName} />
          <Signature label="TESTIGO 1" />
          <Signature label="TESTIGO 2" />
        </div>
      </section>
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

function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
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
            <span>☐</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Signature({ label, name }: { label: string; name?: string }) {
  return (
    <div className="mt-10">
      <div className="border-t border-black pt-2 font-bold">{label}</div>
      {name && <p className="mt-1">{name}</p>}
    </div>
  );
}