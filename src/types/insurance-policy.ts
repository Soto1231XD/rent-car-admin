import { Car } from "@/types/car";

export type InsurancePolicyType = "SEGURO" | "SMART_TAG";

export type InsurancePolicy = {
  id: string;
  carId: string | null;
  type: InsurancePolicyType;
  contractDate?: string | null;
  expirationDate: string;
  policyNumber?: string | null;
  company?: string | null;
  servicePhone?: string | null;
  notes?: string | null;
  car?: Car;
  createdAt?: string;
  updatedAt?: string;
};