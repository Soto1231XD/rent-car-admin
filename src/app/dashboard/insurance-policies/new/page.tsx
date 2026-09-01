import Link from "next/link";
import InsurancePolicyForm from "@/components/insurance-policies/InsurancePolicyForm";
import { getCars } from "@/lib/api";

type Props = {
  searchParams: Promise<{
    carId?: string;
  }>;
};

export default async function NewInsurancePolicyPage({ searchParams }: Props) {
  const { carId } = await searchParams;
  const cars = await getCars();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/insurance-policies"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Volver a pólizas
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Nueva póliza
        </h1>
      </div>

      <InsurancePolicyForm mode="create" cars={cars} initialData={{ carId }} />
    </div>
  );
}
