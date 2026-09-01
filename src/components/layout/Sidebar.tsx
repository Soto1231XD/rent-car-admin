"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Cake,
  CalendarDays,
  Car,
  ChevronDown,
  DollarSign,
  FileText,
  Gauge,
  History,
  Inbox,
  X,
  LayoutDashboard,
  NotebookText,
  PiggyBank,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { getDashboardBadgesResult } from "@/lib/api-client";

const BADGE_POLL_INTERVAL_MS = 60000;
const RENTALS_SEEN_KEY = "rentamivar_rentals_seen_at";
const CLIENTS_SEEN_KEY = "rentamivar_clients_seen_at";
const MAINTENANCE_SEEN_KEY = "rentamivar_maintenance_seen_at";
const POLICIES_SEEN_KEY = "rentamivar_insurance_policies_seen_at";
const LEADS_SEEN_KEY = "rentamivar_leads_seen_at";

type BadgeKey =
  | "pendingRentals"
  | "pendingClients"
  | "pendingServiceCars"
  | "pendingInsurancePolicies"
  | "pendingLeads";

type Badges = Record<BadgeKey, number>;

type MenuLink = {
  name: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: BadgeKey;
};

type MenuCategory = {
  name: string;
  icon: LucideIcon;
  items: MenuLink[];
};

const menu: (MenuLink | MenuCategory)[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Flota",
    icon: Car,
    items: [
      { name: "Carros", href: "/dashboard/cars", icon: Car },
      {
        name: "Mantenimiento",
        href: "/dashboard/maintenance",
        icon: Wrench,
      },
      {
        name: "Control de kilometraje",
        href: "/dashboard/mileage-control",
        icon: Gauge,
        badgeKey: "pendingServiceCars",
      },
      {
        name: "Pólizas y Smart Tag",
        href: "/dashboard/insurance-policies",
        icon: ShieldCheck,
        badgeKey: "pendingInsurancePolicies",
      },
    ],
  },
  {
    name: "Clientes",
    icon: Users,
    items: [
      {
        name: "Clientes",
        href: "/dashboard/clients",
        icon: Users,
        badgeKey: "pendingClients",
      },
      {
        name: "Solicitudes",
        href: "/dashboard/leads",
        icon: Inbox,
        badgeKey: "pendingLeads",
      },
      {
        name: "Cumpleaños",
        href: "/dashboard/clients/birthdays",
        icon: Cake,
      },
    ],
  },
  {
    name: "Operaciones",
    icon: CalendarDays,
    items: [
      {
        name: "Rentas",
        href: "/dashboard/rentals",
        icon: CalendarDays,
        badgeKey: "pendingRentals",
      },
      { name: "Cotizaciones", href: "/dashboard/quotes", icon: FileText },
      { name: "Calendario", href: "/dashboard/calendar", icon: CalendarDays },
    ],
  },
  {
    name: "Finanzas",
    icon: DollarSign,
    items: [
      { name: "Precios", href: "/dashboard/prices", icon: DollarSign },
      { name: "Gastos extras", href: "/dashboard/extra-expenses", icon: ReceiptText },
      { name: "Historial mensual", href: "/dashboard/monthly-history", icon: History },
      { name: "Control mensual", href: "/dashboard/monthly-breakdown", icon: TrendingUp },
      { name: "Carros aparte", href: "/dashboard/aveo", icon: NotebookText },
      { name: "Fondo de ahorro", href: "/dashboard/savings-fund", icon: PiggyBank },
    ],
  },
];

function isMenuCategory(entry: MenuLink | MenuCategory): entry is MenuCategory {
  return "items" in entry;
}

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({ isOpen = false, onClose }: Props) {
  const pathname = usePathname();
  const [badges, setBadges] = useState<Badges>({
    pendingRentals: 0,
    pendingClients: 0,
    pendingServiceCars: 0,
    pendingInsurancePolicies: 0,
    pendingLeads: 0,
  });
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const isLinkActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const toggleCategory = (name: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  useEffect(() => {
    // Landing on a page inside a category should reveal it, without
    // collapsing whatever else the user already had open.
    const activeCategory = menu.find(
      (entry) =>
        isMenuCategory(entry) && entry.items.some((item) => isLinkActive(item.href))
    );

    if (activeCategory) {
      setOpenCategories((prev) =>
        prev.has(activeCategory.name) ? prev : new Set(prev).add(activeCategory.name)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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
    if (pathname.startsWith("/dashboard/mileage-control")) {
      localStorage.setItem(MAINTENANCE_SEEN_KEY, new Date().toISOString());
    }
    if (pathname.startsWith("/dashboard/insurance-policies")) {
      localStorage.setItem(POLICIES_SEEN_KEY, new Date().toISOString());
    }
    if (pathname.startsWith("/dashboard/leads")) {
      localStorage.setItem(LEADS_SEEN_KEY, new Date().toISOString());
    }

    let isMounted = true;

    const loadBadges = async () => {
      const result = await getDashboardBadgesResult({
        sinceRentals: localStorage.getItem(RENTALS_SEEN_KEY),
        sinceClients: localStorage.getItem(CLIENTS_SEEN_KEY),
        sinceCars: localStorage.getItem(MAINTENANCE_SEEN_KEY),
        sincePolicies: localStorage.getItem(POLICIES_SEEN_KEY),
        sinceLeads: localStorage.getItem(LEADS_SEEN_KEY),
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
        className={`fixed inset-y-0 left-0 z-50 h-screen w-72 shrink-0 overflow-y-auto bg-slate-900 p-5 text-white shadow-2xl shadow-slate-900/20 transition-transform duration-300 lg:sticky lg:top-0 lg:z-auto lg:w-64 lg:translate-x-0 ${
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

        <nav className="space-y-1.5">
          {menu.map((entry) => {
            if (isMenuCategory(entry)) {
              const CategoryIcon = entry.icon;
              const isOpenCategory = openCategories.has(entry.name);
              const categoryBadgeCount = entry.items.reduce(
                (sum, item) => sum + (item.badgeKey ? badges[item.badgeKey] : 0),
                0
              );
              const hasActiveChild = entry.items.some((item) => isLinkActive(item.href));

              return (
                <div key={entry.name}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(entry.name)}
                    aria-expanded={isOpenCategory}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      hasActiveChild
                        ? "text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <CategoryIcon size={18} />
                    <span className="flex-1 text-left">{entry.name}</span>
                    {categoryBadgeCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                        {categoryBadgeCount > 99 ? "99+" : categoryBadgeCount}
                      </span>
                    )}
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpenCategory ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid overflow-hidden transition-all duration-200 ${
                      isOpenCategory
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                    aria-hidden={!isOpenCategory}
                  >
                    <div
                      className={`min-h-0 space-y-1 ${isOpenCategory ? "py-1" : ""}`}
                    >
                      {entry.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = isLinkActive(item.href);
                        const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={onClose}
                            tabIndex={isOpenCategory ? 0 : -1}
                            className={`flex items-center gap-3 rounded-xl py-2.5 pl-8 pr-4 text-sm font-medium transition ${
                              isActive
                                ? "bg-white text-slate-950 shadow"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            }`}
                          >
                            <ItemIcon size={16} />
                            <span className="flex-1">{item.name}</span>
                            {badgeCount > 0 && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                                {badgeCount > 99 ? "99+" : badgeCount}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            const Icon = entry.icon;
            const isActive = isLinkActive(entry.href);
            const badgeCount = entry.badgeKey ? badges[entry.badgeKey] : 0;

            return (
              <Link
                key={entry.name}
                href={entry.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-slate-950 shadow"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{entry.name}</span>
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
