import { Car } from "@/types/car";
import { RentalPriceMode, RenterType } from "@/types/rental";

export type Quote = {
  id: string;
  folio: string;
  carId: string | null;
  startDate: string;
  endDate: string;
  daysCharged: number;
  priceMode: RentalPriceMode;
  renterType: RenterType;
  dailyRateApplied: number;
  totalPrice: number;
  deposit: number;
  deliveryFee: number;
  returnFee: number;
  notes?: string | null;
  car?: Car | null;
  createdAt?: string;
  updatedAt?: string;
};