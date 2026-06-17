"use client";

import {
  ChangeEvent,
  FormEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
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

const requiredCurrencyNumber = (message: string) =>
  z.preprocess(normalizeCurrencyValue, z.coerce.number().min(1, message));

const optionalCurrencyNumber = z.preprocess((value) => {
  const normalizedValue = normalizeCurrencyValue(value);

  return normalizedValue === "" ? undefined : normalizedValue;
}, z.coerce.number().min(0).optional());

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const carSchema = z.object({
  brand: z.string().min(1, "La marca es obligatoria"),
  model: z.string().min(1, "El modelo es obligatorio"),
  year: z.coerce.number().min(1990, "El año es obligatorio"),
  plate: optionalText,
  color: optionalText,
  transmission: z.enum(["AUTOMATICO", "ESTANDAR"], {
    message: "La transmisión es obligatoria",
  }),
  engineType: optionalText,
  displacement: optionalText,
  hasCarPlay: z.enum(["true", "false"]).transform((value) => value === "true"),
  trunkCapacity: optionalText,
  passengers: z.coerce.number().min(1, "Debe tener al menos 1 pasajero"),
  dailyPrice: requiredCurrencyNumber("El precio diario es obligatorio"),
  highSeasonPrice: requiredCurrencyNumber(
    "El precio de temporada alta es obligatorio"
  ),
  commissionDailyPrice: optionalCurrencyNumber,
  commissionHighSeasonPrice: optionalCurrencyNumber,
  deposit: requiredCurrencyNumber("El depósito en garantía es obligatorio"),
  status: z.enum(["DISPONIBLE", "RENTADO", "MANTENIMIENTO", "NO_DISPONIBLE"], {
    message: "El estado es obligatorio",
  }),
  description: optionalText,
  featuresText: optionalText,
});

export type CarFormData = z.infer<typeof carSchema>;
type CarFormInput = z.input<typeof carSchema>;

type CarFormProps = {
  mode: "create" | "edit";
  initialData?: Partial<Car>;
  carId?: string;
};

type SelectedImageFile = {
  id: string;
  file: File;
};

export default function CarForm({ mode, initialData, carId }: CarFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [existingImages, setExistingImages] = useState(initialData?.images ?? []);
  const [selectedFiles, setSelectedFiles] = useState<SelectedImageFile[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState(
    initialData?.images?.[0] ? getExistingImageId(initialData.images[0]) : ""
  );
  const totalImages = existingImages.length + selectedFiles.length;

  const selectedPreviews = useMemo(
    () =>
      selectedFiles.map(({ id, file }) => ({
        id,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [selectedFiles]
  );

  const fallbackPrimaryImageId = getFirstImageId(existingImages, selectedFiles);
  const effectivePrimaryImageId =
    primaryImageId &&
    imageIdExists(primaryImageId, existingImages, selectedFiles)
      ? primaryImageId
      : fallbackPrimaryImageId;

  useEffect(() => {
    return () => {
      selectedPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [selectedPreviews]);

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
      engineType: initialData?.engineType ?? "",
      displacement: initialData?.displacement ?? "",
      hasCarPlay: initialData?.hasCarPlay ? "true" : "false",
      trunkCapacity: initialData?.trunkCapacity ?? "",
      passengers: initialData?.passengers ?? undefined,
      dailyPrice: formatCurrencyInputValue(initialData?.dailyPrice),
      highSeasonPrice: formatCurrencyInputValue(initialData?.highSeasonPrice),
      commissionDailyPrice: formatCurrencyInputValue(
        initialData?.commissionDailyPrice
      ),
      commissionHighSeasonPrice: formatCurrencyInputValue(
        initialData?.commissionHighSeasonPrice
      ),
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

    const primaryId = effectivePrimaryImageId;
    const orderedExistingImages = orderExistingImagesByPrimary(
      existingImages,
      primaryId
    );
    const orderedSelectedFiles = orderSelectedFilesByPrimary(
      selectedFiles,
      primaryId
    );

    const payload = {
      brand: data.brand,
      model: data.model,
      year: data.year,
      plate: data.plate,
      color: data.color,
      passengers: data.passengers,
      transmission: data.transmission,
      engineType: data.engineType,
      displacement: data.displacement,
      hasCarPlay: data.hasCarPlay,
      trunkCapacity: data.trunkCapacity,
      dailyPrice: data.dailyPrice,
      highSeasonPrice: data.highSeasonPrice,
      commissionDailyPrice: data.commissionDailyPrice,
      commissionHighSeasonPrice: data.commissionHighSeasonPrice,
      deposit: data.deposit,
      status: data.status,
      description: data.description,
      features: parseFeatures(data.featuresText),
      images: primaryId.startsWith("existing:")
        ? orderedExistingImages
        : existingImages,
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
      orderedSelectedFiles.length > 0
        ? await uploadCarImagesResult(
            result.data.id,
            orderedSelectedFiles.map(({ file }) => file)
          )
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

    if (primaryId.startsWith("new:") && uploadResult.data.images.length > 0) {
      const uploadedImages = uploadResult.data.images.slice(existingImages.length);
      const primaryUploadedImage = uploadedImages[0];

      if (primaryUploadedImage) {
        const reorderResult = await updateCarResult(uploadResult.data.id, {
          ...payload,
          images: [
            primaryUploadedImage,
            ...existingImages,
            ...uploadedImages.slice(1),
          ],
        });

        if (!reorderResult.data) {
          const message =
            reorderResult.error ??
            "El carro se guardo, pero no se pudo marcar la imagen principal.";
          setSubmitError(message);
          showErrorToast(message);
          return;
        }
      }
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
    const newFiles = files.map((file) => ({
      id: getNewImageId(file),
      file,
    }));

    setSelectedFiles((currentFiles) => [...currentFiles, ...newFiles]);
    setPrimaryImageId((currentPrimary) =>
      currentPrimary || getFirstImageId(existingImages, newFiles)
    );
    event.target.value = "";
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <div className="rounded-2xl bg-white p-4 shadow sm:p-6">
        <div className="mb-6 space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Información del vehículo
          </h2>
          <p className="text-sm text-slate-500">
            Los campos que tengan <span className="font-semibold text-red-600">*</span> son obligatorios. El nombre visible se arma con marca, modelo y año.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Marca" required error={errors.brand?.message}>
            <input {...register("brand")} className="input" placeholder="Nissan" />
          </Field>

          <Field label="Modelo" required error={errors.model?.message}>
            <input {...register("model")} className="input" placeholder="Versa" />
          </Field>

          <Field label="Año" required error={errors.year?.message}>
            <input type="number" {...register("year")} className="input" placeholder="2025" />
          </Field>

          <Field label="Placa" error={errors.plate?.message}>
            <input {...register("plate")} className="input" placeholder="ABC-123" />
          </Field>

          <Field label="Color" error={errors.color?.message}>
            <input {...register("color")} className="input" placeholder="Blanco" />
          </Field>

          <Field label="Transmisión" required error={errors.transmission?.message}>
            <select {...register("transmission")} className="input">
              <option value="AUTOMATICO">Automática</option>
              <option value="ESTANDAR">Estándar</option>
            </select>
          </Field>

          <Field label="Combustible" error={errors.engineType?.message}>
            <select {...register("engineType")} className="input">
              <option value="">Selecciona el combustible</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Diesel">Diesel</option>
              <option value="Hibrido">Hibrido</option>
              <option value="Electrico">Electrico</option>
            </select>
          </Field>

          <Field label="Tamaño del motor" error={errors.displacement?.message}>
            <input
              {...register("displacement")}
              className="input"
              placeholder="1.6 L, 2.0 L..."
            />
          </Field>

          <Field label="CarPlay" error={errors.hasCarPlay?.message}>
            <select {...register("hasCarPlay")} className="input">
              <option value="false">No</option>
              <option value="true">Si</option>
            </select>
          </Field>

          <Field label="Espacio de cajuela" error={errors.trunkCapacity?.message}>
            <input
              {...register("trunkCapacity")}
              className="input"
              placeholder="2 maletas grandes, 3 medianas..."
            />
          </Field>

          <Field label="Pasajeros" required error={errors.passengers?.message}>
            <input type="number" {...register("passengers")} className="input" placeholder="5" />
          </Field>

          <Field label="Estado" required error={errors.status?.message}>
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
        <div className="mb-6 space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Precios e imágenes
          </h2>
          <p className="text-sm text-slate-500">
            Los precios y al menos una foto son necesarios para publicar y cotizar el carro correctamente.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Precio diario" required error={errors.dailyPrice?.message}>
            <input
              type="text"
              inputMode="numeric"
              {...register("dailyPrice")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="850"
            />
          </Field>

          <Field label="Precio temporada alta" required error={errors.highSeasonPrice?.message}>
            <input
              type="text"
              inputMode="numeric"
              {...register("highSeasonPrice")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="950"
            />
          </Field>

          <Field label="Precio comisionista" error={errors.commissionDailyPrice?.message}>
            <input
              type="text"
              inputMode="numeric"
              {...register("commissionDailyPrice")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="700"
            />
          </Field>

          <Field
            label="Precio comisionista temporada alta"
            error={errors.commissionHighSeasonPrice?.message}
          >
            <input
              type="text"
              inputMode="numeric"
              {...register("commissionHighSeasonPrice")}
              onInput={formatCurrencyInput}
              className="input"
              placeholder="850"
            />
          </Field>

          <Field label="Depósito en garantía" required error={errors.deposit?.message}>
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
                Fotos del carro <span className="text-red-600">*</span>
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Sube fotos claras del exterior e interior. Marca una foto como
                principal para mostrarla primero en el sitio web. Si subes
                varias, siempre debe quedar una marcada como principal.
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
              {existingImages.map((image) => (
                <ImagePreview
                  key={image}
                  label={
                    effectivePrimaryImageId === getExistingImageId(image)
                      ? "Principal"
                      : "Guardada"
                  }
                  url={getAssetUrl(image)}
                  isPrimary={effectivePrimaryImageId === getExistingImageId(image)}
                  onSetPrimary={() => setPrimaryImageId(getExistingImageId(image))}
                  onRemove={() =>
                    setExistingImages((images) =>
                      images.filter((currentImage) => currentImage !== image)
                    )
                  }
                />
              ))}

              {selectedPreviews.map((preview) => (
                <ImagePreview
                  key={preview.id}
                  label={
                    effectivePrimaryImageId === preview.id
                      ? "Principal"
                      : "Nueva"
                  }
                  url={preview.url}
                  isPrimary={effectivePrimaryImageId === preview.id}
                  onSetPrimary={() => setPrimaryImageId(preview.id)}
                  onRemove={() =>
                    setSelectedFiles((files) =>
                      files.filter((file) => file.id !== preview.id)
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
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
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
  onSetPrimary,
  onRemove,
}: {
  label: string;
  url: string;
  isPrimary?: boolean;
  onSetPrimary: () => void;
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
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onSetPrimary}
            disabled={isPrimary}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
              isPrimary
                ? "cursor-default bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
            aria-label="Marcar como imagen principal"
            title="Marcar como principal"
          >
            <Star size={16} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Quitar imagen"
            title="Quitar imagen"
          >
            <X size={16} />
          </button>
        </div>
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

function getExistingImageId(image: string) {
  return `existing:${image}`;
}

function getNewImageId(file: File) {
  return `new:${crypto.randomUUID()}-${file.name}`;
}

function getFirstImageId(
  existingImages: string[],
  selectedFiles: SelectedImageFile[]
) {
  if (existingImages[0]) {
    return getExistingImageId(existingImages[0]);
  }

  return selectedFiles[0]?.id ?? "";
}

function imageIdExists(
  imageId: string,
  existingImages: string[],
  selectedFiles: SelectedImageFile[]
) {
  return (
    existingImages.some((image) => getExistingImageId(image) === imageId) ||
    selectedFiles.some((file) => file.id === imageId)
  );
}

function orderExistingImagesByPrimary(images: string[], primaryImageId: string) {
  const primaryImage = images.find(
    (image) => getExistingImageId(image) === primaryImageId
  );

  if (!primaryImage) {
    return images;
  }

  return [primaryImage, ...images.filter((image) => image !== primaryImage)];
}

function orderSelectedFilesByPrimary(
  files: SelectedImageFile[],
  primaryImageId: string
) {
  const primaryFile = files.find((file) => file.id === primaryImageId);

  if (!primaryFile) {
    return files;
  }

  return [primaryFile, ...files.filter((file) => file.id !== primaryFile.id)];
}
