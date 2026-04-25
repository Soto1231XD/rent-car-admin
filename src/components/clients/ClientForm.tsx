"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const clientSchema = z.object({
  fullName: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo inválido"),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  idNumber: z.string().min(1, "La identificación es obligatoria"),
  address: z.string().min(1, "La dirección es obligatoria"),
  driverLicenseNumber: z.string().min(1, "La licencia es obligatoria"),
  emergencyContactName: z.string().min(1, "El contacto de emergencia es obligatorio"),
  emergencyContactPhone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  rentedCar: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

type ClientFormProps = {
  mode: "create" | "edit";
  initialData?: Partial<ClientFormData>;
  clientId?: string;
};

export default function ClientForm({
  mode,
  initialData,
  clientId,
}: ClientFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      fullName: initialData?.fullName ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      idNumber: initialData?.idNumber ?? "",
      address: initialData?.address ?? "",
      driverLicenseNumber: initialData?.driverLicenseNumber ?? "",
      emergencyContactName: initialData?.emergencyContactName ?? "",
      emergencyContactPhone: initialData?.emergencyContactPhone ?? "",
      rentedCar: initialData?.rentedCar ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  const onSubmit = (data: ClientFormData) => {
    if (mode === "create") {
      console.log("Crear cliente:", data);
      alert("Cliente creado correctamente");
      router.push("/dashboard/clients");
      return;
    }

    console.log("Editar cliente:", { clientId, ...data });
    alert("Cliente actualizado correctamente");
    router.push(`/dashboard/clients/${clientId}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Información del cliente
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nombre completo" error={errors.fullName?.message}>
            <input {...register("fullName")} className="input" placeholder="Carlos Ramírez" />
          </Field>

          <Field label="Correo electrónico" error={errors.email?.message}>
            <input type="email" {...register("email")} className="input" placeholder="cliente@email.com" />
          </Field>

          <Field label="Teléfono" error={errors.phone?.message}>
            <input {...register("phone")} className="input" placeholder="9981234567" />
          </Field>

          <Field label="Identificación" error={errors.idNumber?.message}>
            <input {...register("idNumber")} className="input" placeholder="INE / Pasaporte" />
          </Field>

          <Field label="Licencia de conducir" error={errors.driverLicenseNumber?.message}>
            <input {...register("driverLicenseNumber")} className="input" placeholder="LIC-123456" />
          </Field>

          <Field label="Vehículo rentado" error={errors.rentedCar?.message}>
            <input {...register("rentedCar")} className="input" placeholder="Nissan Versa 2025" />
          </Field>

          <div className="md:col-span-2">
            <Field label="Dirección" error={errors.address?.message}>
              <input {...register("address")} className="input" placeholder="Cancún, Quintana Roo" />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Contacto de emergencia
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Nombre del contacto" error={errors.emergencyContactName?.message}>
            <input {...register("emergencyContactName")} className="input" placeholder="María Ramírez" />
          </Field>

          <Field label="Teléfono del contacto" error={errors.emergencyContactPhone?.message}>
            <input {...register("emergencyContactPhone")} className="input" placeholder="9987654321" />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Notas adicionales
        </h2>

        <Field label="Notas" error={errors.notes?.message}>
          <textarea
            {...register("notes")}
            className="input min-h-32 resize-none"
            placeholder="Observaciones del cliente..."
          />
        </Field>
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
          {mode === "create" ? "Guardar cliente" : "Actualizar cliente"}
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