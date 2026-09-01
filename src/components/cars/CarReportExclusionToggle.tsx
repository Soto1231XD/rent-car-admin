"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiggyBank } from "lucide-react";
import FormAlert from "@/components/ui/FormAlert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { setCarReportExclusionResult } from "@/lib/api-client";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

type Props = {
  carId: string;
  carName: string;
  excludedFromReportsAt?: string | null;
};

export default function CarReportExclusionToggle({
  carId,
  carName,
  excludedFromReportsAt,
}: Props) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const isExcluded = Boolean(excludedFromReportsAt);

  const handleConfirm = async () => {
    setError("");
    setIsSaving(true);

    const result = await setCarReportExclusionResult(carId, !isExcluded);

    setIsSaving(false);
    setIsConfirmOpen(false);

    if (!result.data) {
      const message =
        result.error ?? "No se pudo actualizar el carro. Intenta de nuevo.";
      setError(message);
      showErrorToast(message);
      return;
    }

    showSuccessToast(
      isExcluded
        ? "El carro vuelve a contar en los reportes generales."
        : "El carro se separó de los reportes generales a partir de hoy."
    );
    router.refresh();
  };

  return (
    <div className="space-y-2">
      {error && <FormAlert message={error} />}

      <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
          <PiggyBank size={16} />
        </span>

        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">
            Cuenta aparte (Carros aparte)
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {isExcluded
              ? `Desde ${formatDate(excludedFromReportsAt)}, las rentas y gastos de este carro ya no se suman en Dashboard, Historial mensual ni Control mensual — solo aparecen en su propio módulo dentro de "Carros aparte".`
              : "Este carro cuenta normalmente en los reportes generales. Actívalo solo si es un auto prestado cuyas ganancias se llevan aparte — al activarlo, este carro obtiene su propio módulo dentro de \"Carros aparte\"."}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                isExcluded
                  ? "border border-slate-300 text-slate-700 hover:bg-slate-100"
                  : "bg-slate-900 text-white hover:bg-slate-700"
              }`}
            >
              {isExcluded
                ? "Volver a incluir en reportes generales"
                : "Excluir de reportes generales desde hoy"}
            </button>

            {isExcluded && (
              <Link
                href={`/dashboard/aveo/${carId}`}
                className="text-sm font-medium text-slate-700 hover:underline"
              >
                Ver su módulo en Carros aparte
              </Link>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={isExcluded ? "Volver a incluir carro" : "Excluir carro"}
        description={
          isExcluded
            ? `${carName} volverá a sumar en los reportes generales a partir de ahora. Lo ya registrado en su módulo de Carros aparte no se borra.`
            : `A partir de hoy, las rentas y gastos nuevos de ${carName} dejarán de sumarse en Dashboard, Historial mensual y Control mensual, y solo se verán en su propio módulo dentro de "Carros aparte". Lo ya registrado hasta hoy no cambia.`
        }
        confirmLabel="Confirmar"
        loadingLabel="Guardando..."
        isLoading={isSaving}
        onConfirm={handleConfirm}
        onClose={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}
