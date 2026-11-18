const IMAGE_SIZE = 626;

const POINTS: { x: number; y: number; n: number }[] = [
  // Vista frontal
  { x: 55, y: 353, n: 1 }, // Defensa delantera izq.
  { x: 175, y: 353, n: 2 }, // Defensa delantera der.
  { x: 38, y: 326, n: 3 }, // Espejo izq.
  { x: 195, y: 326, n: 4 }, // Espejo der.
  { x: 115, y: 288, n: 5 }, // Cofre / parabrisas

  // Vista trasera
  { x: 45, y: 533, n: 6 }, // Defensa trasera izq.
  { x: 185, y: 533, n: 7 }, // Defensa trasera der.
  { x: 115, y: 448, n: 8 }, // Cristal trasero

  // Vista superior
  { x: 145, y: 145, n: 9 }, // Cofre
  { x: 238, y: 143, n: 21 }, // Parabrisas
  { x: 328, y: 143, n: 10 }, // Toldo
  { x: 423, y: 143, n: 22 }, // Medallón
  { x: 460, y: 143, n: 11 }, // Cajuela / maletero

  // Costado A
  { x: 460, y: 350, n: 12 }, // Puerta delantera
  { x: 375, y: 350, n: 13 }, // Puerta trasera
  { x: 522, y: 373, n: 14 }, // Llanta delantera
  { x: 303, y: 373, n: 15 }, // Llanta trasera
  { x: 270, y: 323, n: 16 }, // Cuarto trasero
  { x: 540, y: 336, n: 23 }, // Tapa de gasolina

  // Costado B
  { x: 375, y: 495, n: 17 }, // Puerta delantera
  { x: 460, y: 499, n: 18 }, // Puerta trasera
  { x: 307, y: 530, n: 19 }, // Llanta delantera
  { x: 525, y: 530, n: 20 }, // Llanta trasera
  { x: 280, y: 493, n: 24 }, // Tapa de gasolina
];

export default function CarDamageDiagram() {
  return (
    <div style={{ position: "relative", width: "100%", paddingBottom: "100%" }}>
      <img
        src="/documents/diagrama_carro.jpg"
        alt="Diagrama de daños del vehículo: vistas frontal, trasera, superior y laterales"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      />

      {POINTS.map(({ x, y, n }) => (
        <div
          key={n}
          style={{
            position: "absolute",
            left: `${(x / IMAGE_SIZE) * 100}%`,
            top: `${(y / IMAGE_SIZE) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
          className="flex h-[21px] w-[21px] items-center justify-center rounded-full border border-slate-800 bg-white text-[10px] font-bold text-slate-800"
        >
          {n}
        </div>
      ))}
    </div>
  );
}
