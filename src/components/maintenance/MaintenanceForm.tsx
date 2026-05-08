"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { cars } from "@/lib/mock-data";

type FormData = {
  carName: string;
  serviceType: string;
  cost: number;
  date: string;
  status: string;
  notes?: string;
};

export default function MaintenanceForm() {
  const router = useRouter();

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      status: "PENDIENTE",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Nuevo mantenimiento:", data);

    // 🔥 Simulación lógica importante
    console.log("El carro ahora debería pasar a estado: MANTENIMIENTO");

    alert("Mantenimiento registrado");

    router.push("/dashboard/maintenance");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Registrar mantenimiento
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Vehículo">
            <select {...register("carName")} className="input">
              <option value="">Selecciona un vehículo</option>
              {cars.map((car) => (
                <option key={car.id}>
                  {car.brand} {car.model} {car.year}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tipo de servicio">
            <input
              {...register("serviceType")}
              className="input"
              placeholder="Cambio de aceite"
            />
          </Field>

          <Field label="Costo">
            <input
              type="number"
              {...register("cost")}
              className="input"
              placeholder="800"
            />
          </Field>

          <Field label="Fecha">
            <input type="date" {...register("date")} className="input" />
          </Field>

          <Field label="Estado">
            <select {...register("status")} className="input">
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN PROCESO">En proceso</option>
              <option value="COMPLETADO">Completado</option>
            </select>
          </Field>

          <div className="md:col-span-2">
  <Field label="Comentarios / Observaciones">
    <textarea
      {...register("notes")}
      className="input min-h-24 resize-none"
      placeholder="Ej: Se cambió aceite, filtro y se revisaron frenos..."
    />
  </Field>
</div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="border px-4 py-2 rounded-xl"
        >
          Cancelar
        </button>

        <button className="bg-slate-900 text-white px-4 py-2 rounded-xl">
          Guardar mantenimiento
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
