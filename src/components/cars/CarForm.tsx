"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const carSchema = z.object({
  brand: z.string().min(1, "La marca es obligatoria"),
  model: z.string().min(1, "El modelo es obligatorio"),
  year: z.coerce.number().min(1990, "Año inválido"),
  plate: z.string().min(1, "La placa es obligatoria"),
  color: z.string().min(1, "El color es obligatorio"),
  transmission: z.string().min(1, "La transmisión es obligatoria"),
  fuelType: z.string().min(1, "El combustible es obligatorio"),
  passengers: z.coerce.number().min(1, "Debe tener al menos 1 pasajero"),
  dailyPrice: z.coerce.number().min(1, "El precio diario es obligatorio"),
  weeklyPrice: z.coerce.number().optional(),
  monthlyPrice: z.coerce.number().optional(),
  status: z.string().min(1, "El estado es obligatorio"),
  description: z.string().optional(),
});

export type CarFormData = z.infer<typeof carSchema>;

type CarFormProps = {
  mode: "create" | "edit";
  initialData?: Partial<CarFormData>;
  carId?: string;
};

export default function CarForm({ mode, initialData, carId }: CarFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      brand: initialData?.brand ?? "",
      model: initialData?.model ?? "",
      year: initialData?.year ?? undefined,
      plate: initialData?.plate ?? "",
      color: initialData?.color ?? "",
      transmission: initialData?.transmission ?? "",
      fuelType: initialData?.fuelType ?? "",
      passengers: initialData?.passengers ?? undefined,
      dailyPrice: initialData?.dailyPrice ?? undefined,
      weeklyPrice: initialData?.weeklyPrice ?? undefined,
      monthlyPrice: initialData?.monthlyPrice ?? undefined,
      status: initialData?.status ?? "",
      description: initialData?.description ?? "",
    },
  });

  const onSubmit = (data: CarFormData) => {
    if (mode === "create") {
      console.log("Crear carro:", data);
      alert("Carro creado correctamente");
      router.push("/dashboard/cars");
      return;
    }

    console.log("Editar carro:", { carId, ...data });
    alert("Carro actualizado correctamente");
    router.push(`/dashboard/cars/${carId}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Información del vehículo
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Marca" error={errors.brand?.message}>
            <input {...register("brand")} className="input" placeholder="Nissan" />
          </Field>

          <Field label="Modelo" error={errors.model?.message}>
            <input {...register("model")} className="input" placeholder="Versa" />
          </Field>

          <Field label="Año" error={errors.year?.message}>
            <input type="number" {...register("year")} className="input" placeholder="2025" />
          </Field>

          <Field label="Placa" error={errors.plate?.message}>
            <input {...register("plate")} className="input" placeholder="ABC-123" />
          </Field>

          <Field label="Color" error={errors.color?.message}>
            <input {...register("color")} className="input" placeholder="Blanco" />
          </Field>

          <Field label="Transmisión" error={errors.transmission?.message}>
            <select {...register("transmission")} className="input">
              <option value="">Selecciona</option>
              <option value="AUTOMATIC">Automática</option>
              <option value="MANUAL">Manual</option>
            </select>
          </Field>

          <Field label="Combustible" error={errors.fuelType?.message}>
            <select {...register("fuelType")} className="input">
              <option value="">Selecciona</option>
              <option value="GASOLINE">Gasolina</option>
              <option value="DIESEL">Diésel</option>
              <option value="HYBRID">Híbrido</option>
              <option value="ELECTRIC">Eléctrico</option>
            </select>
          </Field>

          <Field label="Pasajeros" error={errors.passengers?.message}>
            <input type="number" {...register("passengers")} className="input" placeholder="5" />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Precios y estado
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Precio diario" error={errors.dailyPrice?.message}>
            <input type="number" {...register("dailyPrice")} className="input" placeholder="850" />
          </Field>

          <Field label="Precio semanal" error={errors.weeklyPrice?.message}>
            <input type="number" {...register("weeklyPrice")} className="input" placeholder="5000" />
          </Field>

          <Field label="Precio mensual" error={errors.monthlyPrice?.message}>
            <input type="number" {...register("monthlyPrice")} className="input" placeholder="18000" />
          </Field>

          <Field label="Estado" error={errors.status?.message}>
            <select {...register("status")} className="input">
              <option value="">Selecciona</option>
              <option value="AVAILABLE">Disponible</option>
              <option value="MAINTENANCE">Mantenimiento</option>
              <option value="OUT_OF_SERVICE">Fuera de servicio</option>
            </select>
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Descripción" error={errors.description?.message}>
            <textarea
              {...register("description")}
              className="input min-h-32 resize-none"
              placeholder="Descripción general del vehículo..."
            />
          </Field>
        </div>
      </div>

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
          {mode === "create" ? "Guardar carro" : "Actualizar carro"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}