import Link from "next/link";
import { getClients } from "@/lib/api";
import ClientBirthdaysTable, {
  BirthdayEntry,
} from "@/components/clients/ClientBirthdaysTable";

export default async function ClientBirthdaysPage() {
  const clients = await getClients();
  const today = new Date();

  const entries: BirthdayEntry[] = clients
    .filter((client) => Boolean(client.birthDate))
    .map((client) => {
      const birthDate = new Date(client.birthDate as string);
      const nextBirthday = getNextBirthday(birthDate, today);

      return {
        clientId: client.id,
        clientName: client.fullName,
        clientPhone: client.phone,
        birthDate: birthDate.toISOString(),
        nextBirthday: nextBirthday.toISOString(),
        daysUntil: daysUntil(nextBirthday, today),
        month: birthDate.getUTCMonth() + 1,
      };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/clients"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Volver a clientes
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Cumpleaños de clientes
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Clientes con fecha de nacimiento registrada, ordenados por su próximo
          cumpleaños.
        </p>
      </div>

      <ClientBirthdaysTable entries={entries} />
    </div>
  );
}

function getNextBirthday(birthDate: Date, today: Date) {
  const month = birthDate.getUTCMonth();
  const day = birthDate.getUTCDate();
  const todayUTC = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );

  let next = new Date(Date.UTC(today.getUTCFullYear(), month, day));

  if (next.getTime() < todayUTC) {
    next = new Date(Date.UTC(today.getUTCFullYear() + 1, month, day));
  }

  return next;
}

function daysUntil(date: Date, today: Date) {
  const todayUTC = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );

  return Math.round((date.getTime() - todayUTC) / (1000 * 60 * 60 * 24));
}
