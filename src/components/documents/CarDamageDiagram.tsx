"use client";

import { useState } from "react";

type DamagePoint = {
  id: string;
  label: string;
  x: number;
  y: number;
};

const damagePoints: DamagePoint[] = [
  // Vista superior
  { id: "sup_cofre", label: "Vista superior - Cofre", x: 26, y: 24 },
  { id: "sup_parabrisas", label: "Vista superior - Parabrisas", x: 36, y: 24 },
  { id: "sup_techo", label: "Vista superior - Techo", x: 52, y: 24 },
  { id: "sup_medallon", label: "Vista superior - Medallón", x: 63, y: 24 },
  { id: "sup_cajuela", label: "Vista superior - Cajuela", x: 73, y: 25 },

  // Frente
  { id: "frente_cofre", label: "Frente - Cofre", x: 18, y: 52 },
  { id: "frente_defensa", label: "Frente - Defensa delantera", x: 18, y: 59 },
  { id: "frente_faro_izq", label: "Frente - Faro izquierdo", x: 9, y: 55 },
  { id: "frente_faro_der", label: "Frente - Faro derecho", x: 26, y: 55 },
  { id: "frente_parabrisas", label: "Frente - Parabrisas", x: 18, y: 46 },

  // Trasera
  { id: "trasera_cajuela", label: "Trasera - Cajuela", x: 17, y: 80 },
  { id: "trasera_defensa", label: "Trasera - Defensa trasera", x: 17, y: 85 },
  { id: "trasera_calavera_izq", label: "Trasera - Calavera izquierda", x: 9, y: 78 },
  { id: "trasera_calavera_der", label: "Trasera - Calavera derecha", x: 26, y: 78 },
  { id: "trasera_medallon", label: "Trasera - Medallón", x: 17, y: 74 },

  // Lateral izquierdo
  { id: "lat_izq_defensa_del", label: "Lateral izquierdo - Defensa delantera", x: 39, y: 58 },
  { id: "lat_izq_cofre", label: "Lateral izquierdo - Cofre", x: 47, y: 53 },
  { id: "lat_izq_puerta_del", label: "Lateral izquierdo - Puerta delantera", x: 59, y: 55 },
  { id: "lat_izq_puerta_tras", label: "Lateral izquierdo - Puerta trasera", x: 73, y: 54 },
  { id: "lat_izq_salpicadera_tras", label: "Lateral izquierdo - Salpicadera trasera", x: 85, y: 52 },
  { id: "lat_izq_llanta_del", label: "Lateral izquierdo - Llanta delantera", x: 48, y: 60 },
  { id: "lat_izq_llanta_tras", label: "Lateral izquierdo - Llanta trasera", x: 83, y: 60 },
  { id: "lat_izq_cristales", label: "Lateral izquierdo - Cristales", x: 68, y: 49 },

  // Lateral derecho
{ id: "lat_der_defensa_del", label: "Lateral derecho - Defensa delantera", x: 92, y: 85 },
{ id: "lat_der_cofre", label: "Lateral derecho - Cofre", x: 84, y: 79 },
{ id: "lat_der_puerta_del", label: "Lateral derecho - Puerta delantera", x: 70, y: 80 },
{ id: "lat_der_puerta_tras", label: "Lateral derecho - Puerta trasera", x: 58, y: 80 },
{ id: "lat_der_salpicadera_tras", label: "Lateral derecho - Salpicadera trasera", x: 46, y: 79 },
{ id: "lat_der_defensa_tras", label: "Lateral derecho - Defensa trasera", x: 38, y: 85 },

{ id: "lat_der_llanta_del", label: "Lateral derecho - Llanta delantera", x: 84, y: 85 },
{ id: "lat_der_llanta_tras", label: "Lateral derecho - Llanta trasera", x: 50, y: 85 },
{ id: "lat_der_cristales", label: "Lateral derecho - Cristales", x: 63, y: 73 },
];

export default function CarDamageDiagram() {
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);

  const togglePoint = (id: string) => {
    setSelectedPoints((prev) =>
      prev.includes(id)
        ? prev.filter((point) => point !== id)
        : [...prev, id]
    );
  };

  const selectedLabels = damagePoints
    .filter((point) => selectedPoints.includes(point.id))
    .map((point) => point.label);

  return (
    <div>
      <p className="mb-3 text-center text-xs text-slate-600 print:hidden">
        Da clic en la zona donde el vehículo presenta daño.
      </p>

      <div className="relative mx-auto w-full max-w-md print:max-w-[240px]">
        <img
          src="/documents/diagrama_carro.jpg"
          alt="Diagrama del vehículo"
          className="w-full select-none"
        />

        {damagePoints.map((point) => {
          const isSelected = selectedPoints.includes(point.id);

          return (
            <button
              key={point.id}
              type="button"
              title={point.label}
              onClick={() => togglePoint(point.id)}
              className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border transition print:h-3 print:w-3 ${
  isSelected
    ? "border-red-700 bg-red-500"
    : "border-slate-400 bg-white/60 hover:bg-red-200"
}`}
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
            />
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-slate-300 p-3 text-xs text-slate-700 print:hidden">
        <p className="font-bold text-slate-900">Zonas seleccionadas:</p>

        <p className="mt-1">
          {selectedLabels.length > 0
            ? selectedLabels.join(", ")
            : "Ninguna"}
        </p>
      </div>
    </div>
  );
}
