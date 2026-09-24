import { Car } from "@/types/car";
import { Client } from "@/types/client";
import { Membership, MembershipRenewalType } from "@/types/membership";
import { ExtraExpense } from "@/types/extra-expense";
import { GeneralExpense } from "@/types/general-expense";
import { AveoEntry } from "@/types/aveo";
import { InsurancePolicy } from "@/types/insurance-policy";
import { SavingsFundEntry } from "@/types/savings-fund";
import { Lead, LeadStatus } from "@/types/lead";
import { Maintenance, MaintenanceFieldHistory } from "@/types/maintenance";
import { Quote } from "@/types/quote";
import { Rental } from "@/types/rental";
import { getStoredToken } from "@/lib/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:3002";

export type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T | null> {
  const result = await requestResult<T>(path, options);
  return result.data;
}

async function requestResult<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      return {
        data: null,
        error: await getApiErrorMessage(response),
      };
    }

    return {
      data: (await response.json()) as T,
      error: null,
    };
  } catch {
    return {
      data: null,
      error:
        "No se pudo conectar con la API. Revisa que el backend esté encendido.",
    };
  }
}

async function getApiErrorMessage(response: Response) {
  const fallbackByStatus: Record<number, string> = {
    400: "La información enviada no es válida. Revisa los campos marcados.",
    401: "Tu sesión expiró. Inicia sesión de nuevo.",
    403: "No tienes permiso para realizar esta acción.",
    404: "No se encontró el recurso solicitado.",
    409: "Ya existe un registro con esos datos.",
    500: "La API tuvo un problema interno. Intenta de nuevo.",
  };

  try {
    const body = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };

    if (Array.isArray(body.message)) {
      return body.message.join(" ");
    }

    return (
      body.message ??
      body.error ??
      fallbackByStatus[response.status] ??
      "La API rechazó la solicitud."
    );
  } catch {
    return fallbackByStatus[response.status] ?? "La API rechazó la solicitud.";
  }
}

export type SaveCarPayload = {
  brand: string;
  model: string;
  year?: number | null;
  plate?: string;
  color?: string;
  passengers: number;
  transmission: string;
  engineType?: string;
  displacement?: string;
  hasCarPlay?: boolean;
  trunkCapacity?: string;
  dailyPrice: number;
  highSeasonPrice: number;
  commissionDailyPrice?: number;
  commissionHighSeasonPrice?: number;
  deposit: number;
  status?: string;
  currentMileage?: number;
  description?: string;
  features: string[];
  images: string[];
};

export function createCar(payload: SaveCarPayload): Promise<Car | null> {
  return request<Car>("/cars", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createCarResult(payload: SaveCarPayload) {
  return requestResult<Car>("/cars", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCar(
  id: string,
  payload: SaveCarPayload
): Promise<Car | null> {
  return request<Car>(`/cars/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateCarResult(id: string, payload: SaveCarPayload) {
  return requestResult<Car>(`/cars/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCarResult(id: string) {
  return requestResult<Car>(`/cars/${id}`, {
    method: "DELETE",
  });
}

export function setCarReportExclusionResult(id: string, excluded: boolean) {
  return requestResult<Car>(`/cars/${id}/report-exclusion`, {
    method: "PATCH",
    body: JSON.stringify({ excluded }),
  });
}

export async function uploadCarImages(
  id: string,
  files: File[]
): Promise<Car | null> {
  const result = await uploadCarImagesResult(id, files);
  return result.data;
}

export async function uploadCarImagesResult(
  id: string,
  files: File[]
): Promise<ApiResult<Car>> {
  try {
    const token = getStoredToken();
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch(`${API_URL}/cars/${id}/images`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      return {
        data: null,
        error: await getApiErrorMessage(response),
      };
    }

    return {
      data: (await response.json()) as Car,
      error: null,
    };
  } catch {
    return {
      data: null,
      error:
        "No se pudieron subir las imágenes. Revisa que la API esté encendida.",
    };
  }
}

export type SaveClientPayload = {
  fullName: string;
  email?: string;
  phone: string;
  idNumber?: string;
  address?: string;
  driverLicenseNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  birthDate?: string;
  type?: string;
};

export function createClient(
  payload: SaveClientPayload
): Promise<Client | null> {
  return request<Client>("/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createClientResult(payload: SaveClientPayload) {
  return requestResult<Client>("/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateClient(
  id: string,
  payload: SaveClientPayload
): Promise<Client | null> {
  return request<Client>(`/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateClientResult(id: string, payload: SaveClientPayload) {
  return requestResult<Client>(`/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteClientResult(id: string) {
  return requestResult<Client>(`/clients/${id}`, {
    method: "DELETE",
  });
}

export type SaveMembershipPayload = {
  clientId: string;
  renewalType: MembershipRenewalType;
  notes?: string;
};

export function createMembershipResult(payload: SaveMembershipPayload) {
  return requestResult<{ membership: Membership; checkoutUrl: string }>(
    "/memberships",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export function updateMembershipResult(
  id: string,
  payload: Partial<SaveMembershipPayload> & { status?: Membership["status"] }
) {
  return requestResult<Membership>(`/memberships/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteMembershipResult(id: string) {
  return requestResult<Membership>(`/memberships/${id}`, {
    method: "DELETE",
  });
}

export function resendMembershipPaymentLinkResult(id: string) {
  return requestResult<{ checkoutUrl: string }>(
    `/memberships/${id}/resend-payment-link`,
    { method: "POST" }
  );
}

export function cancelMembershipResult(id: string) {
  return requestResult<Membership>(`/memberships/${id}/cancel`, {
    method: "POST",
  });
}

export function updateLeadStatusResult(id: string, status: LeadStatus) {
  return requestResult<Lead>(`/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function convertLeadResult(id: string, clientId: string) {
  return requestResult<Lead>(`/leads/${id}/convert`, {
    method: "PATCH",
    body: JSON.stringify({ clientId }),
  });
}

export async function addClientDocumentResult(
  id: string,
  label: string,
  file: File
): Promise<ApiResult<Client>> {
  try {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append("image", file);
    formData.append("label", label);

    const response = await fetch(`${API_URL}/clients/${id}/documents`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      return {
        data: null,
        error: await getApiErrorMessage(response),
      };
    }

    return {
      data: (await response.json()) as Client,
      error: null,
    };
  } catch {
    return {
      data: null,
      error: `No se pudo subir "${label}". Revisa que la API esté encendida.`,
    };
  }
}

export async function deleteClientDocumentResult(
  id: string,
  documentId: string
): Promise<ApiResult<Client>> {
  return requestResult<Client>(`/clients/${id}/documents/${documentId}`, {
    method: "DELETE",
  });
}

export type SaveRentalPayload = {
  clientId: string;
  carId: string;
  startDate: string;
  endDate?: string;
  rentalType?: string;
  totalPrice: number;
  dailyRateApplied?: number;
  advancePayment?: number;
  renterType?: string;
  priceMode?: string;
  status?: string;
  notes?: string;
  returnMileage?: number;
  deliveryLocationId?: string;
  deliveryPlazaId?: string;
  deliveryAddress?: string;
  returnLocationId?: string;
  returnPlazaId?: string;
  returnAddress?: string;
};

export function createRental(
  payload: SaveRentalPayload
): Promise<Rental | null> {
  return request<Rental>("/rentals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRental(
  id: string,
  payload: SaveRentalPayload
): Promise<Rental | null> {
  return request<Rental>(`/rentals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function createRentalResult(payload: SaveRentalPayload) {
  return requestResult<Rental>("/rentals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateRentalResult(id: string, payload: SaveRentalPayload) {
  return requestResult<Rental>(`/rentals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteRentalResult(id: string) {
  return requestResult<Rental>(`/rentals/${id}`, {
    method: "DELETE",
  });
}

export function confirmRentalResult(id: string) {
  return requestResult<Rental>(`/rentals/${id}/confirm`, {
    method: "PATCH",
  });
}

export type SaveMaintenancePayload = {
  carId: string;
  recordType: "REVISION" | "SERVICIO";
  serviceType?: string;
  cost?: number;
  date: string;
  status?: string;
  notes?: string;
  reviewDate?: string;
  serviceMileage?: number;
  previousMileage?: number;
  nextServiceMileage?: number;
  nextServiceDate?: string;
  providerType?: string;
  location?: string;
  includesMaterial?: boolean;
};

export function createMaintenance(
  payload: SaveMaintenancePayload
): Promise<Maintenance | null> {
  return request<Maintenance>("/maintenances", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createMaintenanceResult(payload: SaveMaintenancePayload) {
  return requestResult<Maintenance>("/maintenances", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMaintenanceResult(
  id: string,
  payload: SaveMaintenancePayload
) {
  return requestResult<Maintenance>(`/maintenances/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteMaintenanceResult(id: string) {
  return requestResult<Maintenance>(`/maintenances/${id}`, {
    method: "DELETE",
  });
}

export function getMaintenanceHistoryResult(id: string) {
  return requestResult<MaintenanceFieldHistory[]>(`/maintenances/${id}/history`);
}

export type SaveExtraExpensePayload = {
  carId?: string | null;
  concept: string;
  cost: number;
  date: string;
  status?: string;
  paidBy?: string;
  notes?: string;
};

export function createExtraExpenseResult(payload: SaveExtraExpensePayload) {
  return requestResult<ExtraExpense>("/extra-expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateExtraExpenseResult(
  id: string,
  payload: SaveExtraExpensePayload
) {
  return requestResult<ExtraExpense>(`/extra-expenses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteExtraExpenseResult(id: string) {
  return requestResult<ExtraExpense>(`/extra-expenses/${id}`, {
    method: "DELETE",
  });
}

export type SaveAveoEntryPayload = {
  carId: string;
  date: string;
  incomeAmount: number;
  incomeNote?: string;
  days?: number;
  companyProfit?: number;
  notes?: string;
  expenses: { amount: number; description: string }[];
};

export function createAveoEntryResult(payload: SaveAveoEntryPayload) {
  return requestResult<AveoEntry>("/aveo", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAveoEntryResult(
  id: string,
  payload: SaveAveoEntryPayload
) {
  return requestResult<AveoEntry>(`/aveo/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteAveoEntryResult(id: string) {
  return requestResult<AveoEntry>(`/aveo/${id}`, {
    method: "DELETE",
  });
}

// Edita solo la "ganancia de la rentadora" de un movimiento manual del
// Aveo, sin reenviar el resto del registro (el backend soporta updates
// parciales).
export function updateAveoEntryCompanyProfitResult(
  id: string,
  companyProfit: number
) {
  return requestResult<AveoEntry>(`/aveo/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ companyProfit }),
  });
}

// Anota/edita la ganancia de la rentadora directamente sobre una renta real
// (automática) del auto marcado como "aparte", sin pasar por el módulo de
// Rentas (que no tiene ni debe tener este campo).
export function setAveoRentalProfitResult(
  rentalId: string,
  companyProfit: number
) {
  return requestResult<{ id: string; rentalId: string; companyProfit: number }>(
    `/aveo/rentals/${rentalId}/profit`,
    {
      method: "PATCH",
      body: JSON.stringify({ companyProfit }),
    }
  );
}

export type SaveSavingsFundEntryPayload = {
  date: string;
  clientName: string;
  incomeAmount: number;
  expenseAmount: number;
  carId?: string | null;
  notes?: string;
};

export function createSavingsFundEntryResult(
  payload: SaveSavingsFundEntryPayload
) {
  return requestResult<SavingsFundEntry>("/savings-fund", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSavingsFundEntryResult(
  id: string,
  payload: SaveSavingsFundEntryPayload
) {
  return requestResult<SavingsFundEntry>(`/savings-fund/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteSavingsFundEntryResult(id: string) {
  return requestResult<SavingsFundEntry>(`/savings-fund/${id}`, {
    method: "DELETE",
  });
}

export type SaveInsurancePolicyPayload = {
  carId: string;
  type: string;
  contractDate?: string;
  expirationDate: string;
  policyNumber?: string;
  company?: string;
  servicePhone?: string;
  notes?: string;
};

export function createInsurancePolicyResult(
  payload: SaveInsurancePolicyPayload
) {
  return requestResult<InsurancePolicy>("/insurance-policies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateInsurancePolicyResult(
  id: string,
  payload: SaveInsurancePolicyPayload
) {
  return requestResult<InsurancePolicy>(`/insurance-policies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteInsurancePolicyResult(id: string) {
  return requestResult<InsurancePolicy>(`/insurance-policies/${id}`, {
    method: "DELETE",
  });
}

export type SaveGeneralExpensePayload = {
  type: string;
  amount: number;
  date: string;
  notes?: string;
};

export function createGeneralExpenseResult(payload: SaveGeneralExpensePayload) {
  return requestResult<GeneralExpense>("/general-expenses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteGeneralExpenseResult(id: string) {
  return requestResult<GeneralExpense>(`/general-expenses/${id}`, {
    method: "DELETE",
  });
}

export type SaveQuotePayload = {
  carId: string;
  startDate: string;
  endDate: string;
  deliveryFee?: number;
  returnFee?: number;
  notes?: string;
};

export function createQuoteResult(payload: SaveQuotePayload) {
  return requestResult<Quote>("/quotes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteQuoteResult(id: string) {
  return requestResult<Quote>(`/quotes/${id}`, {
    method: "DELETE",
  });
}

export type DashboardBadges = {
  pendingRentals: number;
  pendingClients: number;
  pendingServiceCars: number;
  pendingInsurancePolicies: number;
  pendingLeads: number;
};

export function getDashboardBadgesResult(since?: {
  sinceRentals?: string | null;
  sinceClients?: string | null;
  sinceCars?: string | null;
  sincePolicies?: string | null;
  sinceLeads?: string | null;
}) {
  const params = new URLSearchParams();

  if (since?.sinceRentals) {
    params.set("sinceRentals", since.sinceRentals);
  }
  if (since?.sinceClients) {
    params.set("sinceClients", since.sinceClients);
  }
  if (since?.sinceCars) {
    params.set("sinceCars", since.sinceCars);
  }
  if (since?.sincePolicies) {
    params.set("sincePolicies", since.sincePolicies);
  }
  if (since?.sinceLeads) {
    params.set("sinceLeads", since.sinceLeads);
  }

  const query = params.toString();

  return requestResult<DashboardBadges>(
    `/dashboard/badges${query ? `?${query}` : ""}`
  );
}
