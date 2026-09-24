"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 4000;

type Props = {
  // true mientras haya algo que valga la pena re-sincronizar: el status de
  // una sola membresía (detalle) o si la lista completa tiene al menos una
  // en PENDIENTE.
  hasPending: boolean;
};

// Mientras haya algo PENDIENTE, refresca esta página cada pocos segundos --
// el server component vuelve a llamar a getMembership()/getMemberships(),
// que ya re-sincronizan el estado contra Mercado Pago en el backend, así
// que en cuanto el pago se aprueba el cambio aparece solo, sin que nadie
// tenga que recargar a mano.
export default function MembershipAutoRefresh({ hasPending }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!hasPending) {
      return;
    }

    const interval = setInterval(() => {
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [hasPending, router]);

  return null;
}
