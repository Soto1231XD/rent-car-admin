"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Car,
  DollarSign,
  FileText,
  History,
  X,
  LayoutDashboard,
  ReceiptText,
  Users,
  Wrench,
} from "lucide-react";
import { getDashboardBadgesResult } from "@/lib/api-client";

const BADGE_POLL_INTERVAL_MS = 60000;
const RENTALS_SEEN_KEY = "rentamivar_rentals_seen_at";
const CLIENTS_SEEN_KEY = "rentamivar_clients_seen_at";
const CARS_SEEN_KEY = "rentamivar_cars_seen_at";

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
    badgeKey: "pendingServiceCars" as const,
  },
  {
    name: "Clientes",
    href: "/dashboard/clients",
    icon: Users,
    badgeKey: "pendingClients" as const,
  },
  {
    name: "Rentas",
    href: "/dashboard/rentals",
    icon: CalendarDays,
    badgeKey: "pendingRentals" as const,
  },
  {
    name: "Cotizaciones",
    href: "/dashboard/quotes",
    icon: FileText,
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
    name: "Gastos extras",
    href: "/dashboard/extra-expenses",
    icon: ReceiptText,
  },
  {
    name: "Precios",
    href: "/dashboard/prices",
    icon: DollarSign,
  },
  {
    name: "Historial mensual",
    href: "/dashboard/monthly-history",
    icon: History,
  },
];

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ isOpen = false, onClose }: Props) {
  const pathname = usePathname();
  const [badges, setBadges] = useState<{
    pendingRentals: number;
    pendingClients: number;
    pendingServiceCars: number;
  }>({
    pendingRentals: 0,
    pendingClients: 0,
    pendingServiceCars: 0,
  });

  useEffect(() => {
    // Visiting a module clears its bubble: anything already listed there
    // counts as "seen" from now on, even if still unconfirmed. Only items
    // created after this visit will make the bubble reappear.
    if (pathname.startsWith("/dashboard/rentals")) {
      localStorage.setItem(RENTALS_SEEN_KEY, new Date().toISOString());
    }
    if (pathname.startsWith("/dashboard/clients")) {
      localStorage.setItem(CLIENTS_SEEN_KEY, new Date().toISOString());
    }
    if (pathname.startsWith("/dashboard/cars")) {
      localStorage.setItem(CARS_SEEN_KEY, new Date().toISOString());
    }

    let isMounted = true;

    const loadBadges = async () => {
      const result = await getDashboardBadgesResult({
        sinceRentals: localStorage.getItem(RENTALS_SEEN_KEY),
        sinceClients: localStorage.getItem(CLIENTS_SEEN_KEY),
        sinceCars: localStorage.getItem(CARS_SEEN_KEY),
      });

      if (isMounted && result.data) {
        setBadges(result.data);
      }
    };

    loadBadges();
    const interval = setInterval(loadBadges, BADGE_POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pathname]);

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
            <div className="mb-4 h-1.5 w-14 rounded-full bg-red-600" />
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

            const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-slate-950 shadow"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{item.name}</span>
                {badgeCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
