"use client";

import { useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { resendMembershipPaymentLinkResult } from "@/lib/api-client";
import { showErrorToast } from "@/lib/toast";

type Props = {
  membershipId: string;
};

export default function ResendMembershipPaymentLinkButton({ membershipId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    const result = await resendMembershipPaymentLinkResult(membershipId);
    setIsLoading(false);

    if (!result.data) {
      showErrorToast(
        result.error ?? "No se pudo generar el link de pago. Intenta de nuevo."
      );
      return;
    }

    setCheckoutUrl(result.data.checkoutUrl);
  };

  if (checkoutUrl) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          readOnly
          value={checkoutUrl}
          className="input flex-1"
          onFocus={(event) => event.currentTarget.select()}
        />
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(checkoutUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
          {isCopied ? "Copiado" : "Copiar"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCw size={16} />
      {isLoading ? "Generando..." : "Reenviar link de pago"}
    </button>
  );
}
