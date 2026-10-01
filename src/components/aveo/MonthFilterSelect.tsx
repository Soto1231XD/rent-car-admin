"use client";

import { useRouter } from "next/navigation";

type Props = {
  options: { key: string; label: string }[];
  value: string;
};

// Selector simple basado en la URL (?month=YYYY-M) -- así el server
// component de la página puede filtrar las tarjetas de resumen sin
// necesitar su propio estado de cliente.
export default function MonthFilterSelect({ options, value }: Props) {
  const router = useRouter();

  return (
    <select
      value={value}
      onChange={(event) => {
        const params = new URLSearchParams(window.location.search);
        params.set("month", event.target.value);
        router.push(`?${params.toString()}`);
      }}
      className="input w-full sm:w-56"
    >
      {options.map((option) => (
        <option key={option.key} value={option.key}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
