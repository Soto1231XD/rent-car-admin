export type PriceStatus = "DISPONIBLE" | "RENTADO" | "NO DISPONIBLE";

export type CarPrice = {
  id: number;
  model: string;
  capacity: number;
  deposit: number;
  dailyPrice: number;
  highSeasonPrice: number;
  status: PriceStatus;
  transmission: "AUTOMATICO" | "ESTANDAR";
  comments?: string;
};