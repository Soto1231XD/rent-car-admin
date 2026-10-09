"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Cake, Gift } from "lucide-react";
import {
  MembershipDayRedemption,
  MembershipDaysSummary,
} from "@/types/membership";
import { redeemMembershipDaysResult } from "@/lib/api-client";
import { showErrorToast } from "@/lib/toast";

type Props = {
  membershipId: string;
  summary: MembershipDaysSummary;
  redemptions: MembershipDayRedemption[];
};

export default function MembershipDaysCard({
  membershipId,
  summary,
  redemptions,
}: Props) {
  const router = useRouter();
  const [days, setDays] = useState(1);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBirthday, setIsSavingBirthday] = useState(false);

  const canRedeemRegular =
    summary.availableDays > 0 &&
    (!summary.nextRegularRedemptionEligibleDate ||
      new Date(summary.nextRegularRedemptionEligibleDate) <= new Date());

  const handleRedeemRegular = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const result = await redeemMembershipDaysResult(membershipId, {
      source: "REGULAR",
      days,
      notes: notes || undefined,
    });

    setIsSaving(false);

    if (!result.data) {
      showErrorToast(result.error ?? "No se pudo registrar el canje.");
      return;
    }

    setDays(1);
    setNotes("");
    router.refresh();
  };

  const handleRedeemBirthday = async () => {
    setIsSavingBirthday(true);

    const result = await redeemMembershipDaysResult(membershipId, {
      source: "CUMPLEANOS",
      days: 1,
    });

    setIsSavingBirthday(false);

    if (!result.data) {
      showErrorToast(result.error ?? "No se pudo registrar el día de cumpleaños.");
      return;
    }

    router.refresh();
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
      <h2 className="mb-5 text-lg font-semibold text-slate-900">
        Días de renta
      </h2>

      <div className="grid grid-cols-3 gap-3 text-center">
        <SummaryStat label="Acumulados" value={summary.accruedDays} />
        <SummaryStat label="Usados" value={summary.redeemedDays} />
        <SummaryStat
          label="Disponibles"
          value={summary.availableDays}
          highlight
        />
      </div>

      {!canRedeemRegular && summary.nextRegularRedemptionEligibleDate && (
        <p className="mt-4 text-xs text-amber-700">
          Próximo canje disponible hasta el{" "}
          {summary.nextRegularRedemptionEligibleDate.slice(0, 10)} (1 mes de
          espera entre canjes).
        </p>
      )}

      {canRedeemRegular && (
        <form
          onSubmit={handleRedeemRegular}
          className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end"
        >
          <label className="block sm:w-28">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Días a canjear
            </span>
            <input
              type="number"
              min={1}
              max={Math.min(10, summary.availableDays)}
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="input"
            />
          </label>

          <label className="block flex-1">
            <span className="mb-1 block text-xs font-medium text-slate-600">
              Notas (opcional)
            </span>
            <input
              type="text"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="input"
              placeholder="Ej. canjeado para renta del 10 al 12 de octubre"
            />
          </label>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            <Gift size={16} />
            {isSaving ? "Registrando..." : "Registrar canje"}
          </button>
        </form>
      )}

      {summary.birthdayAvailable && (
        <div className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-amber-800">
            <Cake size={18} className="shrink-0" />
            Es su mes de cumpleaños y aún no ha usado su día de regalo.
          </p>
          <button
            type="button"
            onClick={handleRedeemBirthday}
            disabled={isSavingBirthday}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingBirthday ? "Registrando..." : "Registrar día de cumpleaños"}
          </button>
        </div>
      )}

      {redemptions.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            Historial de canjes
          </h3>
          <ul className="space-y-1.5 text-sm text-slate-600">
            {redemptions.map((redemption) => (
              <li key={redemption.id} className="flex items-baseline gap-2">
                <span className="font-medium text-slate-900">
                  {redemption.date.slice(0, 10)}
                </span>
                <span>
                  {redemption.days} día(s) ·{" "}
                  {redemption.source === "CUMPLEANOS"
                    ? "Cumpleaños"
                    : "Regular"}
                  {redemption.notes ? ` · ${redemption.notes}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function SummaryStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? "border-teal-200 bg-teal-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p
        className={`text-2xl font-bold ${
          highlight ? "text-teal-700" : "text-slate-900"
        }`}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">{label}</p>
    </div>
  );
}
