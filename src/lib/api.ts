import { cookies } from "next/headers";
import { Car } from "@/types/car";
import { Client } from "@/types/client";
import { ExtraExpense } from "@/types/extra-expense";
import { Maintenance } from "@/types/maintenance";
import { Quote } from "@/types/quote";
import { Rental } from "@/types/rental";
import { AUTH_COOKIE } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:3002";

export type DashboardSummary = {
  cars: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    unavailable: number;
  };
  clients: {
    total: number;
  };
  rentals: {
    active: number;
    reserved: number;
    completed: number;
  };
  maintenances: {
    pending: number;
    inProgress: number;
  };
  income: {
    currentMonth: number;
    commissionerCurrentMonth: number;
  };
  upcomingRentals: Rental[];
  pendingMaintenanceList: Maintenance[];
};

async function request<T>(path: string): Promise<T | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;

    const response = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      return null;
    }

    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function getCars(): Promise<Car[]> {
  return (await request<Car[]>("/cars")) ?? [];
}

export async function getCar(id: string): Promise<Car | null> {
  return request<Car>(`/cars/${id}`);
}

export async function getClients(): Promise<Client[]> {
  return (await request<Client[]>("/clients")) ?? [];
}

export async function getClient(id: string): Promise<Client | null> {
  return request<Client>(`/clients/${id}`);
}

export async function getRentals(): Promise<Rental[]> {
  return (await request<Rental[]>("/rentals")) ?? [];
}

export async function getRental(id: string): Promise<Rental | null> {
  return request<Rental>(`/rentals/${id}`);
}

export async function getMaintenances(): Promise<Maintenance[]> {
  return (await request<Maintenance[]>("/maintenances")) ?? [];
}

export async function getMaintenance(id: string): Promise<Maintenance | null> {
  return request<Maintenance>(`/maintenances/${id}`);
}

export async function getExtraExpenses(): Promise<ExtraExpense[]> {
  return (await request<ExtraExpense[]>("/extra-expenses")) ?? [];
}

export async function getExtraExpense(
  id: string
): Promise<ExtraExpense | null> {
  return request<ExtraExpense>(`/extra-expenses/${id}`);
}

export async function getDashboardSummary(): Promise<DashboardSummary | null> {
  return request<DashboardSummary>("/dashboard/summary");
}

export async function getQuotes(): Promise<Quote[]> {
  return (await request<Quote[]>("/quotes")) ?? [];
}

export async function getQuote(id: string): Promise<Quote | null> {
  return request<Quote>(`/quotes/${id}`);
}
