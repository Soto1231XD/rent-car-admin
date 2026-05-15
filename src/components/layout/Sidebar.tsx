"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Car,
  DollarSign,
  X,
  LayoutDashboard,
  Users,
  Wrench,
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Carros",
    href: "/dashboard/cars",
    icon: Car,
  },
  {
    name: "Clientes",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Rentas",
    href: "/dashboard/rentals",
    icon: CalendarDays,
  },
  {
    name: "Calendario",
    href: "/dashboard/calendar",
    icon: CalendarDays,
  },
  {
    name: "Mantenimiento",
    href: "/dashboard/maintenance",
    icon: Wrench,
  },
  {
    name: "Precios",
    href: "/dashboard/prices",
    icon: DollarSign,
  },
];

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ isOpen = false, onClose }: Props) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menu"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-sm transition lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen w-72 shrink-0 bg-slate-900 p-5 text-white shadow-2xl shadow-slate-900/20 transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:w-64 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 h-1.5 w-14 rounded-full bg-cyan-300" />
            <h1 className="text-xl font-bold">RENTAMIVAR</h1>
            <p className="mt-1 text-xs text-slate-400">Sistema interno</p>
          </div>

          <button
            type="button"
            aria-label="Cerrar menu"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2">
          {menu.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-slate-900 shadow"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
