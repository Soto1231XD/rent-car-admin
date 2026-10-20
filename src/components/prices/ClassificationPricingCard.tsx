"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClassificationPricing } from "@/types/classification-pricing";
import { updateClassificationPricingResult } from "@/lib/api-client";
import { showErrorToast } from "@/lib/toast";
import {
  formatCurrencyInput,
  formatCurrencyInputValue,
  toMoneyNumber,
} from "@/lib/format-currency";

type Props = {
  pricing: ClassificationPricing[];
};

const CLASSIFICATION_ORDER = ["A", "B", "C", "D", "E"] as const;

export default function ClassificationPricingCard({ pricing }: Props) {
  const router = useRouter();
  const byClassification = new Map(
    pricing.map((row) => [row.classification, row.swapFee])
  );

  return (
    <section className="mt-6 rounded-2xl bg-white p-4 shadow sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Precio base por clasificación
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Cargo de cambio de clasificación que aplica a todos los autos de esa
        letra. Si un auto en particular debe cobrar distinto al resto de su
        clasificación, configúralo como excepción en la ficha de ese auto (
        <span className="font-medium">Editar auto</span>) en vez de cambiarlo
        aquí.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-5">
        {CLASSIFICATION_ORDER.map((classification) => (
          <ClassificationRow
            key={classification}
            classification={classification}
            swapFee={byClassification.get(classification) ?? 0}
            onSaved={() => router.refresh()}
          />
        ))}
      </div>
    </section>
  );
}

function ClassificationRow({
  classification,
  swapFee,
  onSaved,
}: {
  classification: string;
  swapFee: number;
  onSaved: () => void;
}) {
  const [value, setValue] = useState(formatCurrencyInputValue(swapFee));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateClassificationPricingResult(classification, {
      swapFee: toMoneyNumber(value),
    });
    setIsSaving(false);

    if (!result.data) {
      showErrorToast(
        result.error ?? "No se pudo guardar el precio de esta clasificación."
      );
      return;
    }

    onSaved();
  };

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        Clasificación {classification}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onInput={formatCurrencyInput}
        className="input"
        placeholder="0"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
}
