import { cookies } from "next/headers";
import { AveoEntry, AveoLedger } from "@/types/aveo";
import { Car } from "@/types/car";
import { SavingsFundEntry } from "@/types/savings-fund";
import { Client } from "@/types/client";
import { Membership } from "@/types/membership";
import { ExtraExpense } from "@/types/extra-expense";
import { GeneralExpense } from "@/types/general-expense";
import { InsurancePolicy } from "@/types/insurance-policy";
import { Lead } from "@/types/lead";
import { Maintenance } from "@/types/maintenance";
import { Quote } from "@/types/quote";
import { MonthlyBreakdownEntry } from "@/types/monthly-breakdown";
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

export type MonthlyHistoryEntry = {
  month: string;
  income: number;
  commissionerIncome: number;
  extraExpenses: number;
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

export async function getMemberships(): Promise<Membership[]> {
  return (await request<Membership[]>("/memberships")) ?? [];
}

export async function getMembership(id: string): Promise<Membership | null> {
  return request<Membership>(`/memberships/${id}`);
}

export async function getLeads(): Promise<Lead[]> {
  return (await request<Lead[]>("/leads")) ?? [];
}

export async function getLead(id: string): Promise<Lead | null> {
  return request<Lead>(`/leads/${id}`);
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

export async function getAveoEntries(): Promise<AveoEntry[]> {
  return (await request<AveoEntry[]>("/aveo")) ?? [];
}

export async function getAveoEntry(id: string): Promise<AveoEntry | null> {
  return request<AveoEntry>(`/aveo/${id}`);
}

export async function getAveoLedger(): Promise<AveoLedger[]> {
  return (await request<AveoLedger[]>("/aveo/ledger")) ?? [];
}

export async function getSavingsFundEntries(): Promise<SavingsFundEntry[]> {
  return (await request<SavingsFundEntry[]>("/savings-fund")) ?? [];
}

export async function getSavingsFundEntry(
  id: string
): Promise<SavingsFundEntry | null> {
  return request<SavingsFundEntry>(`/savings-fund/${id}`);
}

export async function getExtraExpense(
  id: string
): Promise<ExtraExpense | null> {
  return request<ExtraExpense>(`/extra-expenses/${id}`);
}

export async function getInsurancePolicies(): Promise<InsurancePolicy[]> {
  return (await request<InsurancePolicy[]>("/insurance-policies")) ?? [];
}

export async function getInsurancePolicy(
  id: string
): Promise<InsurancePolicy | null> {
  return request<InsurancePolicy>(`/insurance-policies/${id}`);
}

export async function getDashboardSummary(): Promise<DashboardSummary | null> {
  return request<DashboardSummary>("/dashboard/summary");
}

export async function getMonthlyHistory(): Promise<MonthlyHistoryEntry[]> {
  return (await request<MonthlyHistoryEntry[]>("/dashboard/monthly-history")) ?? [];
}

export async function getMonthlyBreakdown(): Promise<MonthlyBreakdownEntry[]> {
  return (
    (await request<MonthlyBreakdownEntry[]>("/dashboard/monthly-breakdown")) ?? []
  );
}

export async function getGeneralExpenses(): Promise<GeneralExpense[]> {
  return (await request<GeneralExpense[]>("/general-expenses")) ?? [];
}

export async function getQuotes(): Promise<Quote[]> {
  return (await request<Quote[]>("/quotes")) ?? [];
}

export async function getQuote(id: string): Promise<Quote | null> {
  return request<Quote>(`/quotes/${id}`);
}
