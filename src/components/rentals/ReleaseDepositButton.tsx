"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import FormAlert from "@/components/ui/FormAlert";
import { releaseDepositResult } from "@/lib/api-client";
import { showErrorToast, showSuccessToast } from "@/lib/toast";

type Props = {
  id: string;
  clientName: string;
};

export default function ReleaseDepositButton({ id, clientName }: Props) {
  const router = useRouter();
  const [isReleasing, setIsReleasing] = useState(false);
  const [error, setError] = useState("");

  const handleRelease = async () => {
    setError("");
    setIsReleasing(true);

    const result = await releaseDepositResult(id);

    setIsReleasing(false);

    if (!result.data) {
      const message =
        result.error ?? "No se pudo liberar el depósito. Intenta de nuevo.";
      setError(message);
      showErrorToast(message);
      return;
    }

    showSuccessToast(
      `Se liberó con éxito el depósito del cliente ${clientName}.`
    );
    router.refresh();
  };

  return (
    <div className="space-y-2">
      {error && <FormAlert message={error} />}

      <button
        type="button"
        onClick={handleRelease}
        disabled={isReleasing}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <ShieldCheck size={16} />
        {isReleasing ? "Liberando..." : "Liberar depósito"}
      </button>
    </div>
  );
}