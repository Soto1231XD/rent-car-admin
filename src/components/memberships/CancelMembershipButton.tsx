"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { cancelMembershipResult } from "@/lib/api-client";
import { showErrorToast } from "@/lib/toast";

type Props = {
  membershipId: string;
  clientName: string;
};

export default function CancelMembershipButton({
  membershipId,
  clientName,
}: Props) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    const result = await cancelMembershipResult(membershipId);
    setIsCancelling(false);

    if (!result.data) {
      showErrorToast(
        result.error ?? "No se pudo cancelar la membresía. Intenta de nuevo."
      );
      return;
    }

    setIsDialogOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
      >
        <Ban size={16} />
        Cancelar membresía
      </button>

      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Cancelar membresía"
        description={
          <>
            ¿Seguro que deseas cancelar la membresía de{" "}
            <strong>{clientName}</strong>? Si tiene renovación automática, se
            cancela también la suscripción en Mercado Pago para que no se le
            vuelva a cobrar.
          </>
        }
        confirmLabel="Cancelar membresía"
        loadingLabel="Cancelando..."
        cancelLabel="Volver"
        isLoading={isCancelling}
        onConfirm={handleCancel}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
