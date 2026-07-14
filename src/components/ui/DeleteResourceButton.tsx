"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import FormAlert from "@/components/ui/FormAlert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  deleteCarResult,
  deleteClientResult,
  deleteExtraExpenseResult,
  deleteMaintenanceResult,
  deleteQuoteResult,
  deleteRentalResult,
} from "@/lib/api-client";
import { showErrorToast } from "@/lib/toast";

type ResourceType =
  | "car"
  | "client"
  | "rental"
  | "maintenance"
  | "extraExpense"
  | "quote";

type DeleteResourceButtonProps = {
  id: string;
  resourceType: ResourceType;
  resourceName: string;
  redirectTo: string;
};

const deleteByType = {
  car: deleteCarResult,
  client: deleteClientResult,
  rental: deleteRentalResult,
  maintenance: deleteMaintenanceResult,
  extraExpense: deleteExtraExpenseResult,
  quote: deleteQuoteResult,
};

const labels: Record<ResourceType, string> = {
  car: "carro",
  client: "cliente",
  rental: "renta",
  maintenance: "mantenimiento",
  extraExpense: "gasto extra",
  quote: "cotización",
};

export default function DeleteResourceButton({
  id,
  resourceType,
  resourceName,
  redirectTo,
}: DeleteResourceButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);

    const resourceLabel = labels[resourceType];
    const result = await deleteByType[resourceType](id);

    setIsDeleting(false);

    if (!result.data) {
      const nextError =
        result.error ??
        `No se pudo eliminar este ${resourceLabel}. Intenta de nuevo.`;

      setError(nextError);
      showErrorToast(nextError);
      return;
    }

    setIsDialogOpen(false);
    router.refresh();
    router.push(`${redirectTo}?success=deleted`);
  };

  return (
    <div className="space-y-3">
      {error && <FormAlert message={error} />}

      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        disabled={isDeleting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <Trash2 size={16} />
        {isDeleting ? "Eliminando..." : "Eliminar"}
      </button>

      <ConfirmDialog
        isOpen={isDialogOpen}
        title={`Eliminar ${labels[resourceType]}`}
        description={
          <>
            ¿Seguro que deseas eliminar <strong>{resourceName}</strong>? Esta
            acción no se puede deshacer.
          </>
        }
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
