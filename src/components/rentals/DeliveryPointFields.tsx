import { DELIVERY_LOCATIONS, PLAZAS, getDeliveryFee } from "@/lib/delivery-locations";
import { formatCurrency } from "@/lib/format-currency";

type Props = {
  label: string;
  locationId: string;
  plazaId: string;
  address: string;
  onLocationChange: (value: string) => void;
  onPlazaChange: (value: string) => void;
  onAddressChange: (value: string) => void;
};

export default function DeliveryPointFields({
  label,
  locationId,
  plazaId,
  address,
  onLocationChange,
  onPlazaChange,
  onAddressChange,
}: Props) {
  const fee = getDeliveryFee(locationId, plazaId);

  return (
    <div className="flex flex-col gap-2">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </span>
        <select
          value={locationId}
          onChange={(event) => onLocationChange(event.target.value)}
          className="input"
        >
          <option value="">No especificado / no solicitado</option>
          {DELIVERY_LOCATIONS.map((location) => (
            <option key={location.id} value={location.id}>
              {location.label}
            </option>
          ))}
        </select>
      </label>

      {locationId === "plaza" && (
        <select
          value={plazaId}
          onChange={(event) => onPlazaChange(event.target.value)}
          className="input"
        >
          <option value="">Selecciona una plaza</option>
          {PLAZAS.map((plaza) => (
            <option key={plaza.id} value={plaza.id}>
              {plaza.label}
              {plaza.fee > 0 ? ` (+${formatCurrency(plaza.fee)})` : ""}
            </option>
          ))}
        </select>
      )}

      {(locationId === "domicilio" || locationId === "hotel_cancun") && (
        <input
          type="text"
          value={address}
          onChange={(event) => onAddressChange(event.target.value)}
          placeholder={
            locationId === "domicilio"
              ? "Dirección de entrega"
              : "Nombre del hotel"
          }
          className="input"
        />
      )}

      {locationId && (locationId !== "plaza" || plazaId) && (
        <span
          className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
            fee > 0 ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {fee > 0 ? `+ ${formatCurrency(fee)}` : "Sin costo adicional"}
        </span>
      )}
    </div>
  );
}
