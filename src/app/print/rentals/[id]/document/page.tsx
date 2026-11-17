import Link from "next/link";
import QRCode from "qrcode";
import UnifiedRentalDocument from "@/components/documents/UnifiedRentalDocument";
import PrintButton from "@/components/documents/PrintButton";
import { getRental } from "@/lib/api";

const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/profile.php?id=61581148135605",
  instagram: "https://www.instagram.com/rentamivar",
  tiktok: "https://www.tiktok.com/@rentamivar",
};

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PrintRentalDocumentPage({ params }: Props) {
  const { id } = await params;
  const rental = await getRental(id);

  if (!rental) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-xl font-bold text-slate-900">
            Documento no encontrado
          </h1>
          <Link
            href="/dashboard/rentals"
            className="mt-4 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            ← Volver a rentas
          </Link>
        </div>
      </main>
    );
  }

  // errorCorrectionLevel "H" (alto, tolera hasta ~30% de daño/obstrucción)
  // porque el logo de la red se superpone al centro del QR -- con el nivel
  // por default (M, ~15%) correría el riesgo de no escanear bien.
  const qrOptions = { margin: 1, width: 280, errorCorrectionLevel: "H" as const };
  const [facebookQr, instagramQr, tiktokQr] = await Promise.all([
    QRCode.toDataURL(SOCIAL_LINKS.facebook, qrOptions).catch(() => null),
    QRCode.toDataURL(SOCIAL_LINKS.instagram, qrOptions).catch(() => null),
    QRCode.toDataURL(SOCIAL_LINKS.tiktok, qrOptions).catch(() => null),
  ]);

  return (
    <main className="min-h-screen bg-slate-100 p-6 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-[816px] justify-between print:hidden">
        <Link
          href={`/dashboard/rentals/${rental.id}`}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          ← Volver
        </Link>
        <PrintButton label="Imprimir / Guardar PDF" />
      </div>

      <UnifiedRentalDocument
        rental={rental}
        socialQrCodes={{
          facebook: facebookQr,
          instagram: instagramQr,
          tiktok: tiktokQr,
        }}
      />
    </main>
  );
}
