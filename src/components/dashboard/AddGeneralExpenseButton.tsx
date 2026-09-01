"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import FormAlert from "@/components/ui/FormAlert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { GeneralExpenseType } from "@/types/general-expense";
import { createGeneralExpenseResult } from "@/lib/api-client";
import { showErrorToast } from "@/lib/toast";

type Props = {
  type: GeneralExpenseType;
  label: string;
  defaultDate: string;
};

export default function AddGeneralExpenseButton({ type, label, defaultDate }: Props) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setAmount("");
    setDate(defaultDate);
    setNotes("");
    setError("");
  };

  const handleSave = async () => {
    setError("");

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }
    if (!date) {
      setError("Selecciona una fecha.");
      return;
    }

    setIsSaving(true);

    const result = await createGeneralExpenseResult({
      type,
      amount: parsedAmount,
      date,
      notes: notes || undefined,
    });

    setIsSaving(false);

    if (!result.data) {
      const message =
        result.error ?? "No se pudo guardar el gasto. Intenta de nuevo.";
      setError(message);
      showErrorToast(message);
      return;
    }

    setIsDialogOpen(false);
    resetForm();
    router.refresh();
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => {
          resetForm();
          setIsDialogOpen(true);
        }}
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
      >
        <Plus size={14} /> Agregar {label}
      </button>

      <ConfirmDialog
        isOpen={isDialogOpen}
        title={`Registrar ${label.toLowerCase()}`}
        confirmLabel="Guardar"
        loadingLabel="Guardando..."
        isLoading={isSaving}
        onConfirm={handleSave}
        onClose={() => {
          if (!isSaving) {
            setIsDialogOpen(false);
          }
        }}
        description={
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">
                Monto
              </span>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="input"
                placeholder="10000"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">
                Fecha
              </span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="input"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">
                Notas (opcional)
              </span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="input min-h-16 resize-none"
              />
            </label>

            {error && <FormAlert message={error} />}
          </div>
        }
      />
    </div>
  );
}
