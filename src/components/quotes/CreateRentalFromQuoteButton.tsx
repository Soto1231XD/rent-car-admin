"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Client } from "@/types/client";
import { Quote } from "@/types/quote";
import CreateRentalFromQuoteModal from "@/components/quotes/CreateRentalFromQuoteModal";

type Props = {
  quote: Quote;
  clients: Client[];
};

export default function CreateRentalFromQuoteButton({ quote, clients }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (quote.rental) {
    return (
      <Link
        href={`/dashboard/rentals/${quote.rental.id}`}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-sm font-medium text-emerald-700 hover:bg-emerald-100"
      >
        <CheckCircle2 size={16} />
        Renta ya creada
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="block w-full rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-700"
      >
        Crear renta
      </button>

      <CreateRentalFromQuoteModal
        quote={quote}
        clients={clients}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCreated={(rentalId) => {
          setIsOpen(false);
          router.refresh();
          router.push(`/dashboard/rentals/${rentalId}`);
        }}
      />
    </>
  );
}
