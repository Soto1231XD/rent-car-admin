"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { CarPrice } from "@/types/price";

type PriceFormData = Omit<CarPrice, "id">;

type Props = {
  mode: "create" | "edit";
  initialData?: Partial<PriceFormData>;
  priceId?: string;
};

export default function PriceForm({ mode, initialData, priceId }: Props) {
  const router = useRouter();

  const { register, handleSubmit } = useForm<PriceFormData>({
    defaultValues: {
      model: initialData?.model ?? "",
      capacity: initialData?.capacity ?? 5,
      deposit: initialData?.deposit ?? 6000,
      dailyPrice: initialData?.dailyPrice ?? 0,
      highSeasonPrice: initialData?.highSeasonPrice ?? 0,
      status: initialData?.status ?? "DISPONIBLE",
      transmission: initialData?.transmission ?? "AUTOMATICO",
      comments: initialData?.comments ?? "",
    },
  });

  const onSubmit = (data: PriceFormData) => {
    if (mode === "create") {
      console.log("Crear precio:", data);
      alert("Precio registrado correctamente");
      router.push("/dashboard/prices");
      return;
    }

    console.log("Editar precio:", { priceId, ...data });
    alert("Precio actualizado correctamente");
    router.push("/dashboard/prices");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Información de tarifa
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Modelo">
            <input
              {...register("model")}
              className="input"
              placeholder="Ej: Versa Rojo"
            />
          </Field>

          <Field label="Capacidad">
            <input
              type="number"
              {...register("capacity", { valueAsNumber: true })}
              className="input"
              placeholder="5"
            />
          </Field>

          <Field label="Depósito en garantía">
            <input
              type="number"
              {...register("deposit", { valueAsNumber: true })}
              className="input"
              placeholder="6000"
            />
          </Field>

          <Field label="Precio por día">
            <input
              type="number"
              {...register("dailyPrice", { valueAsNumber: true })}
              className="input"
              placeholder="850"
            />
          </Field>

          <Field label="Precio temporada alta">
            <input
              type="number"
              {...register("highSeasonPrice", { valueAsNumber: true })}
              className="input"
              placeholder="950"
            />
          </Field>

          <Field label="Estado">
            <select {...register("status")} className="input">
              <option value="DISPONIBLE">Disponible</option>
              <option value="RENTADO">Rentado</option>
              <option value="NO DISPONIBLE">No disponible</option>
            </select>
          </Field>

          <Field label="Transmisión">
            <select {...register("transmission")} className="input">
              <option value="AUTOMATICO">Automático</option>
              <option value="ESTANDAR">Estándar</option>
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Comentarios">
              <textarea
                {...register("comments")}
                className="input min-h-24 resize-none"
                placeholder="Ej: No disponible por mantenimiento, aplica precio especial, unidad reservada..."
              />
            </Field>
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
          {mode === "create" ? "Guardar precio" : "Actualizar precio"}
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
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}