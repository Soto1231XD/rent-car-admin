import { Car } from "@/types/car";
import { RentalPriceMode } from "@/types/rental";

export type Quote = {
  id: string;
  folio: string;
  carId: string | null;
  startDate: string;
  endDate: string;
  daysCharged: number;
  priceMode: RentalPriceMode;
  dailyRateApplied: number;
  totalPrice: number;
  deposit: number;
  notes?: string | null;
  car?: Car | null;
  createdAt?: string;
  updatedAt?: string;
};