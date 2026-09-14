// Debe mantenerse sincronizado con rent-car-web (src/lib/delivery-locations.ts)
// y rent-car-api (src/pricing/delivery-fee.util.ts). Esta copia solo se usa
// para mostrar las opciones y una vista previa de la tarifa en el formulario;
// el backend jamás confía en el fee que mande el cliente, siempre lo
// recalcula a partir del id (ver resolveDeliveryFields en rentals.service.ts).

export type DeliveryLocationId =
  | "domicilio"
  | "plaza"
  | "aeropuerto_cancun"
  | "hotel_cancun"
  | "puerto_morelos"
  | "playa_del_carmen"
  | "tulum"
  | "aeropuerto_tulum"
  | "merida";

export type PlazaId =
  | "mi_plaza_heroes"
  | "multiplaza_kabah"
  | "plaza_outlet"
  | "plaza_cancun_mall"
  | "gran_plaza_cancun"
  | "plaza_las_americas"
  | "plaza_hollywood"
  | "puerto_cancun";

export const DELIVERY_LOCATIONS: { id: DeliveryLocationId; label: string; fee: number }[] = [
  { id: "domicilio", label: "Domicilio", fee: 0 },
  { id: "plaza", label: "Plaza", fee: 0 }, // el monto real depende de la plaza elegida
  { id: "aeropuerto_cancun", label: "Aeropuerto de Cancún", fee: 300 },
  { id: "hotel_cancun", label: "Hotel en Cancún", fee: 300 },
  { id: "puerto_morelos", label: "Puerto Morelos", fee: 0 },
  { id: "playa_del_carmen", label: "Playa del Carmen", fee: 750 },
  { id: "tulum", label: "Tulum", fee: 1300 },
  { id: "aeropuerto_tulum", label: "Aeropuerto de Tulum", fee: 1600 },
  { id: "merida", label: "Mérida", fee: 2600 },
];

export const PLAZAS: { id: PlazaId; label: string; fee: number }[] = [
  { id: "mi_plaza_heroes", label: "Mi Plaza Héroes", fee: 0 },
  { id: "multiplaza_kabah", label: "Multiplaza Kabah", fee: 0 },
  { id: "plaza_outlet", label: "La Plaza Outlet", fee: 0 },
  { id: "plaza_cancun_mall", label: "Plaza Cancún Mall", fee: 0 },
  { id: "gran_plaza_cancun", label: "Gran Plaza Cancún", fee: 0 },
  { id: "plaza_las_americas", label: "Plaza Las Américas", fee: 0 },
  { id: "plaza_hollywood", label: "Plaza Hollywood", fee: 0 },
  { id: "puerto_cancun", label: "Puerto Cancún", fee: 0 },
];

export function getDeliveryFee(locationId?: string, plazaId?: string): number {
  if (!locationId) {
    return 0;
  }

  if (locationId === "plaza") {
    return PLAZAS.find((plaza) => plaza.id === plazaId)?.fee ?? 0;
  }

  return DELIVERY_LOCATIONS.find((location) => location.id === locationId)?.fee ?? 0;
}
