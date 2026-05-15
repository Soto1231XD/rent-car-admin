"use client";

type Props = {
  label: string;
};

export default function PrintButton({ label }: Props) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
    >
      {label}
    </button>
  );
}
