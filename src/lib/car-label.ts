export function formatCarLabel(car: {
  brand: string;
  model: string;
  year?: number | null;
}) {
  return car.year ? `${car.brand} ${car.model} ${car.year}` : `${car.brand} ${car.model}`;
}
