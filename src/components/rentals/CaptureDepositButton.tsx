"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import FormAlert from "@/components/ui/FormAlert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { captureDepositResult } from "@/lib/api-client";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { formatCurrency } from "@/lib/format-currency";

type Props = {
  id: string;
  depositAmount: number;
  clientName: string;
};

export default function CaptureDepositButton({
  id,
  depositAmount,
  clientName,
}: Props) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [amount, setAmount] = useState(String(depositAmount));
  const [error, setError] = useState("");

  const handleCapture = async () => {
    setError("");

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }

    setIsCapturing(true);

    const result = await captureDepositResult(id, parsedAmount);

    setIsCapturing(false);

    if (!result.data) {
      const message =
        result.error ?? "No se pudo capturar el depósito. Intenta de nuevo.";
      setError(message);
      showErrorToast(message);
      return;
    }

    showSuccessToast(
      `Se le ha cobrado ${formatCurrency(parsedAmount)} al cliente ${clientName}.`
    );
    setIsDialogOpen(false);
    router.refresh();
  };

  return (
    <div className="space-y-2">
      {error && !isDialogOpen && <FormAlert message={error} />}

      <button
        type="button"
        onClick={() => {
          setAmount(String(depositAmount));
          setError("");
          setIsDialogOpen(true);
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 sm:w-auto"
      >
        <ShieldAlert size={16} />
        Capturar depósito (hubo daño)
      </button>

      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Capturar depósito"
        confirmLabel="Capturar depósito"
        loadingLabel="Capturando..."
        isLoading={isCapturing}
        onConfirm={handleCapture}
        onClose={() => {
          if (!isCapturing) {
            setIsDialogOpen(false);
          }
        }}
        description={
          <div className="space-y-3">
            <p>
              El depósito retenido es de{" "}
              <strong>{formatCurrency(depositAmount)}</strong>.
              Indica cuánto cobrar por el daño; el resto se libera
              automáticamente.
            </p>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">
                Monto a capturar
              </span>
              <input
                type="number"
                min={1}
                max={depositAmount}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="input"
              />
            </label>

            {error && <FormAlert message={error} />}
          </div>
        }
      />
    </div>
  );
}