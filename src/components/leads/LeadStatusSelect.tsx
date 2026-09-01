"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LeadStatus } from "@/types/lead";
import { updateLeadStatusResult } from "@/lib/api-client";
import { showErrorToast } from "@/lib/toast";

type Props = {
  leadId: string;
  status: LeadStatus;
};

export default function LeadStatusSelect({ leadId, status }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = event.target.value as LeadStatus;
    setIsSaving(true);

    const result = await updateLeadStatusResult(leadId, nextStatus);

    setIsSaving(false);

    if (!result.data) {
      showErrorToast(
        result.error ?? "No se pudo actualizar el estado de la solicitud."
      );
      return;
    }

    router.refresh();
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isSaving}
      className="input w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      <option value="NUEVA">Nueva</option>
      <option value="CONTACTADA">Contactada</option>
      <option value="CERRADA">Cerrada</option>
    </select>
  );
}
