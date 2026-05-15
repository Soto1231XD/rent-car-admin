"use client";

import { ChangeEvent, FormEvent, ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Star, UploadCloud, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car } from "@/types/car";
import {
  createCarResult,
  updateCarResult,
  uploadCarImagesResult,
} from "@/lib/api-client";
import { getAssetUrl } from "@/lib/assets";
import FormAlert from "@/components/ui/FormAlert";
import { showErrorToast } from "@/lib/toast";

const currencyNumber = z.preprocess(
  normalizeCurrencyValue,
  z.coerce.number().min(1, "El precio diario es obligatorio")
);

const optionalNumber = z.preprocess(
  (value) =>
    value === "" || value === null ? undefined : normalizeCurrencyValue(value),
  z.coerce.number().min(0).optional()
);

const carSchema = z.object({
  brand: z.string().min(1, "La marca es obligatoria"),
  model: z.string().min(1, "El modelo es obligatorio"),
  year: z.coerce.number().min(1990, "Año inválido"),
  plate: z.string().min(1, "La placa es obligatoria"),
  color: z.string().min(1, "El color es obligatorio"),
  transmission: z.enum(["AUTOMATICO", "ESTANDAR"], {
    message: "La transmisión es obligatoria",
  }),
  passengers: z.coerce.number().min(1, "Debe tener al menos 1 pasajero"),
  dailyPrice: currencyNumber,
  highSeasonPrice: optionalNumber,
  deposit: optionalNumber,
  status: z.enum(["DISPONIBLE", "RENTADO", "MANTENIMIENTO", "NO_DISPONIBLE"], {
    message: "El estado es obligatorio",
  }),
  description: z.string().optional(),
  featuresText: z.string().optional(),
});

export type CarFormData = z.infer<typeof carSchema>;
type CarFormInput = z.input<typeof carSchema>;

type CarFormProps = {
  mode: "create" | "edit";
  initialData?: Partial<Car>;
  carId?: string;
};

export default function CarForm({ mode, initialData, carId }: CarFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [existingImages, setExistingImages] = useState(initialData?.images ?? []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const totalImages = existingImages.length + selectedFiles.length;

  const selectedPreviews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [selectedFiles]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarFormInput, unknown, CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      brand: initialData?.brand ?? "",
      model: initialData?.model ?? "",
      year: initialData?.year ?? undefined,
      plate: initialData?.plate ?? "",
      color: initialData?.color ?? "",
      transmission: initialData?.transmission ?? "AUTOMATICO",
      passengers: initialData?.passengers ?? undefined,
      dailyPrice: formatCurrencyInputValue(initialData?.dailyPrice),
      highSeasonPrice: formatCurrencyInputValue(initialData?.highSeasonPrice),
      deposit: formatCurrencyInputValue(initialData?.deposit),
      status: initialData?.status ?? "DISPONIBLE",
      description: initialData?.description ?? "",
      featuresText: initialData?.features?.join("\n") ?? "",
    },
  });

  const onInvalid = () => {
    const message = "Revisa los campos marcados antes de guardar el carro.";
    setSubmitError(message);
    showErrorToast(message);
  };

  const onSubmit = async (data: CarFormData) => {
    setSubmitError("");

    if (totalImages === 0) {
      const message = "Agrega al menos una imagen del carro.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    setIsSaving(true);

    const payload = {
      brand: data.brand,
      model: data.model,
      year: data.year,
      plate: data.plate,
      color: data.color,
      passengers: data.passengers,
      transmission: data.transmission,
      dailyPrice: data.dailyPrice,
      highSeasonPrice: data.highSeasonPrice,
      deposit: data.deposit,
      status: data.status,
      description: data.description,
      features: parseFeatures(data.featuresText),
      images: existingImages,
    };

    const result =
      mode === "create"
        ? await createCarResult(payload)
        : carId
          ? await updateCarResult(carId, payload)
          : { data: null, error: "No se encontró el carro a actualizar." };

    if (!result.data) {
      setIsSaving(false);
      const message =
        result.error ??
        "No se pudo guardar el carro. Revisa los datos e intenta de nuevo.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    const uploadResult =
      selectedFiles.length > 0
        ? await uploadCarImagesResult(result.data.id, selectedFiles)
        : { data: result.data, error: null };

    setIsSaving(false);

    if (!uploadResult.data) {
      const message =
        uploadResult.error ??
        "El carro se guardó, pero no se pudieron subir las imágenes.";
      setSubmitError(message);
      showErrorToast(message);
      return;
    }

    router.refresh();
    router.push(
      `/dashboard/cars/${uploadResult.data.id}?success=${
        mode === "create" ? "created" : "updated"
      }`
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles((currentFiles) => [...currentFiles, ...files]);
    event.target.value = "";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <div className="rounded-2xl bg-white p-4 shadow sm:p-6">
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
              <option value="AUTOMATICO">Automática</option>
              <option value="ESTANDAR">Estándar</option>
            </select>
          </Field>

          <Field label="Pasajeros" error={errors.passengers?.message}>
            <input type="number" {...register("passengers")} className="input" placeholder="5" />
          </Field>

          <Field label="Estado" error={errors.status?.message}>
            <select {...register("status")} className="input">
              <option value="DISPONIBLE">Disponible</option>
              <option value="RENTADO">Rentado</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="NO_DISPONIBLE">No disponible</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Precios e imágenes
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Precio diario" error={errors.dailyPrice?.message}>
            <input
              type="text"
              inputMode="numeric"
              {...register("dailyPrice")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="850"
            />
          </Field>

          <Field label="Precio temporada alta" error={errors.highSeasonPrice?.message}>
            <input
              type="text"
              inputMode="numeric"
              {...register("highSeasonPrice")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="950"
            />
          </Field>

          <Field label="Depósito" error={errors.deposit?.message}>
            <input
              type="text"
              inputMode="numeric"
              {...register("deposit")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="6,000"
            />
          </Field>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Fotos del carro
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Sube fotos claras del exterior e interior. La primera imagen
                guardada será la principal del sitio web.
              </p>
            </div>

            <span className="text-xs font-medium text-slate-500">
              {totalImages} {totalImages === 1 ? "imagen" : "imágenes"}
            </span>
          </div>

          <label
            htmlFor="car-images"
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-slate-500 hover:bg-slate-100"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
              <UploadCloud size={24} />
            </span>
            <span className="mt-3 text-sm font-semibold text-slate-900">
              Seleccionar imágenes
            </span>
            <span className="mt-1 max-w-md text-xs leading-5 text-slate-500">
              Puedes elegir varias fotos al mismo tiempo. Formatos permitidos:
              JPG, PNG o WEBP.
            </span>
            <input
              id="car-images"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          {totalImages === 0 ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
              Aún no hay fotos cargadas para este carro.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {existingImages.map((image, index) => (
                <ImagePreview
                  key={image}
                  label={index === 0 ? "Principal" : "Guardada"}
                  url={getAssetUrl(image)}
                  isPrimary={index === 0}
                  onRemove={() =>
                    setExistingImages((images) =>
                      images.filter((currentImage) => currentImage !== image)
                    )
                  }
                />
              ))}

              {selectedPreviews.map((preview, index) => (
                <ImagePreview
                  key={`${preview.name}-${index}`}
                  label="Nueva"
                  url={preview.url}
                  onRemove={() =>
                    setSelectedFiles((files) =>
                      files.filter((_, fileIndex) => fileIndex !== index)
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
          Características y descripción
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Características" error={errors.featuresText?.message}>
            <textarea
              {...register("featuresText")}
              className="input min-h-32 resize-none"
              placeholder="Aire acondicionado&#10;Bluetooth&#10;Cámara de reversa"
            />
            <p className="mt-1 text-xs text-slate-500">
              Escribe una característica por línea.
            </p>
          </Field>

          <Field label="Descripción" error={errors.description?.message}>
            <textarea
              {...register("description")}
              className="input min-h-32 resize-none"
              placeholder="Descripción general del vehículo..."
            />
          </Field>
        </div>
      </div>

      {submitError && <FormAlert message={submitError} />}

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
          disabled={isSaving}
          className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving
            ? "Guardando..."
            : mode === "create"
              ? "Guardar carro"
              : "Actualizar carro"}
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
  children: ReactNode;
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

function ImagePreview({
  label,
  url,
  isPrimary = false,
  onRemove,
}: {
  label: string;
  url: string;
  isPrimary?: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className="relative h-36 bg-slate-200 bg-cover bg-center"
        style={{ backgroundImage: `url("${url}")` }}
      >
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
            isPrimary
              ? "bg-slate-900 text-white"
              : "bg-white/95 text-slate-700"
          }`}
        >
          {isPrimary ? <Star size={12} /> : <ImagePlus size={12} />}
          {label}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <span className="truncate text-xs text-slate-500">
          {isPrimary ? "Imagen principal del catálogo" : "Foto del vehículo"}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          aria-label="Quitar imagen"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function parseFeatures(value?: string) {
  return (value ?? "")
    .split("\n")
    .map((feature) => feature.trim())
    .filter(Boolean);
}

function normalizeCurrencyValue(value: unknown) {
  return typeof value === "string" ? value.replace(/,/g, "") : value;
}

function formatCurrencyInput(event: FormEvent<HTMLInputElement>) {
  event.currentTarget.value = formatCurrencyInputValue(event.currentTarget.value);
}

function formatCurrencyInputValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  const digits = String(value).replace(/\D/g, "");

  return digits ? Number(digits).toLocaleString("es-MX") : "";
}
