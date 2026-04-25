"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  Users,
  Calendar,
  LayoutDashboard,
  CreditCard,
  Wrench,
} from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Carros", href: "/dashboard/cars", icon: Car },
  { name: "Clientes", href: "/dashboard/clients", icon: Users },
  { name: "Rentas", href: "/dashboard/rentals", icon: Calendar },
  { name: "Calendario", href: "/dashboard/calendar", icon: Calendar },
  { name: "Mantenimiento", href: "/dashboard/maintenance", icon: Wrench },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white p-5 h-screen">
      <h1 className="text-xl font-bold mb-8">
        Admin Panel
      </h1>

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
              className={`flex items-center gap-3 rounded-lg px-4 py-2 transition ${
                isActive
                  ? "bg-slate-700"
                  : "hover:bg-slate-800"
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}