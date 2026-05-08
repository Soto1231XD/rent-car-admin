"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

type Props = {
  onMenuClick?: () => void;
};

export default function Header({ onMenuClick }: Props) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 sm:py-4">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={onMenuClick}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-800">
            Rentamivar Admin
          </h2>
          <p className="text-xs text-slate-500">
            Panel administrativo
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-800">
            Administrador
          </p>
          <p className="text-xs text-slate-500">
            Personal autorizado
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 sm:px-4"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </header>
  );
}
