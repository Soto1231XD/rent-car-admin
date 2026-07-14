import Link from "next/link";
import QRCode from "qrcode";
import QuoteDocument from "@/components/documents/QuoteDocument";
import PrintButton from "@/components/documents/PrintButton";
import { getQuote } from "@/lib/api";

const WHATSAPP_PHONE = "529983998112";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PrintQuotePage({ params }: Props) {
  const { id } = await params;
  const quote = await getQuote(id);

  if (!quote) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-xl font-bold text-slate-900">
            Cotización no encontrada
          </h1>
          <Link
            href="/dashboard/quotes"
            className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Volver a cotizaciones
          </Link>
        </div>
      </main>
    );
  }

  const carName = quote.car
    ? `${quote.car.brand} ${quote.car.model} ${quote.car.year}`
    : "un vehículo";
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
    `Hola, quiero información sobre la cotización del ${carName}`
  )}`;
  const qrDataUrl = await QRCode.toDataURL(whatsappUrl, { margin: 1, width: 240 }).catch(
    () => null
  );

  return (
    <main className="min-h-screen bg-slate-100 p-6 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[860px] justify-between print:hidden">
        <Link
          href={`/dashboard/quotes/${quote.id}`}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          ← Volver
        </Link>
        <PrintButton label="Imprimir cotización" />
      </div>

      <QuoteDocument quote={quote} qrDataUrl={qrDataUrl} />
    </main>
  );
}