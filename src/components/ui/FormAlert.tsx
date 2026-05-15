import { AlertCircle } from "lucide-react";

type FormAlertProps = {
  title?: string;
  message: string;
};

export default function FormAlert({
  title = "No se pudo continuar",
  message,
}: FormAlertProps) {
  return (
    <div className="flex gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 leading-5">{message}</p>
      </div>
    </div>
  );
}
