import { Car } from "@/types/car";
import { Client } from "@/types/client";
import { Rental } from "@/types/rental";
import { Maintenance, MaintenanceStatus } from "@/types/maintenance";

export const cars: Car[] = [
  {
    id: 1,
    brand: "Nissan",
    model: "Versa",
    year: 2025,
    plate: "ABC-123",
    color: "Blanco",
    transmission: "AUTOMATICO",
    fuelType: "GASOLINA",
    passengers: 5,
    status: "DISPONIBLE",
    dailyPrice: 850,
    weeklyPrice: 5000,
    monthlyPrice: 18000,
    description: "Vehículo compacto, económico y cómodo para ciudad.",
  },
  {
    id: 2,
    brand: "Chevrolet",
    model: "Aveo",
    year: 2024,
    plate: "XYZ-987",
    color: "Gris",
    transmission: "MANUAL",
    fuelType: "GASOLINA",
    passengers: 5,
    status: "DISPONIBLE",
    dailyPrice: 750,
    weeklyPrice: 4500,
    monthlyPrice: 16000,
    description: "Unidad ideal para traslados diarios.",
  },
  {
    id: 3,
    brand: "Toyota",
    model: "Yaris",
    year: 2023,
    plate: "JKL-456",
    color: "Rojo",
    transmission: "AUTOMATICO",
    fuelType: "GASOLINA",
    passengers: 5,
    status: "MANTENIMIENTO",
    dailyPrice: 900,
    weeklyPrice: 5500,
    monthlyPrice: 19000,
    description: "Vehículo cómodo para ciudad y viajes cortos.",
  },
];

export const clients: Client[] = [
  {
    id: 1,
    fullName: "Carlos Ramírez",
    email: "carlos.ramirez@email.com",
    phone: "9981234567",
    idNumber: "INE-123456",
    address: "Cancún, Quintana Roo",
    driverLicenseNumber: "LIC-987654",
    emergencyContactName: "María Ramírez",
    emergencyContactPhone: "9987654321",
    rentedCar: "Nissan Versa",
    notes: "Cliente frecuente.",
  },
  {
    id: 2,
    fullName: "Ana López",
    email: "ana.lopez@email.com",
    phone: "9985552233",
    idNumber: "INE-654321",
    address: "Playa del Carmen, Quintana Roo",
    driverLicenseNumber: "LIC-456789",
    emergencyContactName: "Luis López",
    emergencyContactPhone: "9983331122",
    rentedCar: "Chevrolet Aveo",
    notes: "Solicita factura.",
  },
];

export const rentals: Rental[] = [
  {
    id: 1,
    clientName: "Carlos Ramírez",
    carName: "Nissan Versa 2025",
    startDate: "2026-04-20",
    endDate: "2026-04-25",
    totalPrice: 4250,
    status: "ACTIVO",
  },
  {
    id: 2,
    clientName: "Ana López",
    carName: "Chevrolet Aveo 2024",
    startDate: "2026-04-10",
    endDate: "2026-04-15",
    totalPrice: 3750,
    status: "COMPLETADO",
  },
];

export const maintenances: Maintenance[] = [
  {
    id: 1,
    carName: "Nissan Versa 2025",
    serviceType: "Cambio de aceite",
    cost: 800,
    date: "2026-04-15",
    status: "COMPLETADO",
    notes: "Se cambió filtro y aceite sintético",
  },
  {
    id: 2,
    carName: "Toyota Yaris 2023",
    serviceType: "Revisión general",
    cost: 1200,
    date: "2026-04-20",
    status: "EN PROGRESO",
  },
];