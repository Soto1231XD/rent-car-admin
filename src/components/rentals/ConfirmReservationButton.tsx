"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import FormAlert from "@/components/ui/FormAlert";
import { confirmRentalResult } from "@/lib/api-client";
import { showErrorToast } from "@/lib/toast";

type Props = {
  id: string;
};

export default function ConfirmReservationButton({ id }: Props) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setError("");
    setIsConfirming(true);

    const result = await confirmRentalResult(id);

    setIsConfirming(false);

    if (!result.data) {
      const message =
        result.error ?? "No se pudo confirmar la reservación. Intenta de nuevo.";
      setError(message);
      showErrorToast(message);
      return;
    }

    router.refresh();
  };

  return (
    <div className="space-y-2">
      {error && <FormAlert message={error} />}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={isConfirming}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <BadgeCheck size={16} />
        {isConfirming ? "Confirmando..." : "Confirmar reservación"}
      </button>
    </div>
  );
}