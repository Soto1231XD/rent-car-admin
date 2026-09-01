import type { ReactNode } from "react";

type Props = {
  title: string;
  value: number | string;
  detail?: string;
  icon?: ReactNode;
  className?: string;
  valueClassName?: string;
  highlight?: "positive" | "negative";
};

export default function SummaryCard({
  title,
  value,
  detail,
  icon,
  className = "",
  valueClassName = "text-2xl sm:text-3xl",
  highlight,
}: Props) {
  const valueColorClass =
    highlight === "positive"
      ? "text-emerald-700"
      : highlight === "negative"
        ? "text-rose-700"
        : "text-slate-900";

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p
            className={`mt-2 break-words font-bold leading-tight tracking-normal tabular-nums ${valueColorClass} ${valueClassName}`}
          >
            {value}
          </p>
          {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
        </div>

        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
