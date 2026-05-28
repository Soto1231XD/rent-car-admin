import { Car } from "@/types/car";
import { Client } from "@/types/client";
import { Maintenance } from "@/types/maintenance";
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
  year: number;
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
  deposit: number;
  status?: string;
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
  idNumber: string;
  address?: string;
  driverLicenseNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
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

export type SaveRentalPayload = {
  clientId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  priceMode?: string;
  status?: string;
  notes?: string;
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

export type SaveMaintenancePayload = {
  carId: string;
  serviceType: string;
  cost: number;
  date: string;
  status?: string;
  notes?: string;
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
