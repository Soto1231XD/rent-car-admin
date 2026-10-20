import { CarClassification } from "@/types/car";

export type ClassificationPricing = {
  classification: CarClassification;
  swapFee: number;
  updatedAt?: string;
};
