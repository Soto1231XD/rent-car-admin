"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cars, clients } from "@/lib/mock-data";

const schema = z.object({
  clientName: z.string(),
  carName: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  totalPrice: z.coerce.number(),
  status: z.string(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  mode: "create" | "edit";
  initialData?: Partial<FormData>;
  rentalId?: string;
};

export default function RentalForm({
  mode,
  initialData,
  rentalId,
}: Props) {
  const router = useRouter();

  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientName: initialData?.clientName ?? "",
      carName: initialData?.carName ?? "",
      startDate: initialData?.startDate ?? "",
      endDate: initialData?.endDate ?? "",
      totalPrice: initialData?.totalPrice ?? undefined,
      status: initialData?.status ?? "RESERVATION",
    },
  });

  const onSubmit = (data: FormData) => {
    if (mode === "create") {
      console.log("Crear renta:", data);
      alert("Renta creada");
      router.push("/dashboard/rentals");
      return;
    }

    console.log("Editar renta:", { rentalId, ...data });
    alert("Renta actualizada");
    router.push(`/dashboard/rentals/${rentalId}`);
  };

 return (
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
    <section className="rounded-2xl bg-white p-6 shadow">
      <h2 className="mb-6 text-lg font-semibold text-slate-900">
        Información de la renta
      </h2>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Cliente">
          <select {...register("clientName")} className="input">
            <option value="">Selecciona un cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.fullName}>
                {client.fullName}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Vehículo">
          <select {...register("carName")} className="input">
            <option value="">Selecciona un vehículo</option>
            {cars.map((car) => (
              <option
                key={car.id}
                value={`${car.brand} ${car.model} ${car.year}`}
              >
                {car.brand} {car.model} {car.year}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Fecha de entrega">
          <input
            type="date"
            {...register("startDate")}
            className="input"
          />
        </Field>

        <Field label="Fecha de devolución">
          <input
            type="date"
            {...register("endDate")}
            className="input"
          />
        </Field>

        <Field label="Total de la renta">
          <input
            type="number"
            {...register("totalPrice")}
            className="input"
            placeholder="4250"
          />
        </Field>

        <Field label="Estado de la renta">
          <select {...register("status")} className="input">
            <option value="RESERVATION">Reservación</option>
            <option value="ACTIVE">Activa</option>
            <option value="COMPLETED">Completada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </Field>
      </div>
    </section>

    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        Cancelar
      </button>

      <button
        type="submit"
        className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        {mode === "create" ? "Guardar renta" : "Actualizar renta"}
      </button>
    </div>
  </form>
);
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
}