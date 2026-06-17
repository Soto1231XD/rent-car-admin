"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { showSuccessToast } from "@/lib/toast";

const successMessages: Record<string, Record<string, string>> = {
  "/dashboard/cars": {
    deleted: "Carro eliminado correctamente.",
  },
  "/dashboard/clients": {
    deleted: "Cliente eliminado correctamente.",
  },
  "/dashboard/rentals": {
    deleted: "Renta eliminada correctamente.",
  },
  "/dashboard/maintenance": {
    created: "Mantenimiento registrado correctamente.",
    updated: "Mantenimiento actualizado correctamente.",
    deleted: "Mantenimiento eliminado correctamente.",
  },
  "/dashboard/extra-expenses": {
    created: "Gasto extra registrado correctamente.",
    updated: "Gasto extra actualizado correctamente.",
    deleted: "Gasto extra eliminado correctamente.",
  },
};

export default function ToastFeedback() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  useEffect(() => {
    if (!success) {
      return;
    }

    const message =
      getDetailSuccessMessage(pathname, success) ??
      successMessages[pathname]?.[success];

    if (!message) {
      return;
    }

    showSuccessToast(message);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("success");
    const query = nextParams.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams, success]);

  return null;
}

function getDetailSuccessMessage(pathname: string, success: string) {
  if (pathname.startsWith("/dashboard/cars/")) {
    return success === "created"
      ? "Carro guardado correctamente."
      : success === "updated"
        ? "Carro actualizado correctamente."
        : null;
  }

  if (pathname.startsWith("/dashboard/clients/")) {
    return success === "created"
      ? "Cliente guardado correctamente."
      : success === "updated"
        ? "Cliente actualizado correctamente."
        : null;
  }

  if (pathname.startsWith("/dashboard/rentals/")) {
    return success === "created"
      ? "Renta guardada correctamente."
      : success === "updated"
        ? "Renta actualizada correctamente."
        : null;
  }

  return null;
}
