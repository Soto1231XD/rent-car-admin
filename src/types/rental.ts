export type RentalStatus =
  | "RESERVACIÓN"
  | "ACTIVO"
  | "COMPLETADO"
  | "CANCELADO";

export type Rental = {
  id: number;
  clientName: string;
  carName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: RentalStatus;
};