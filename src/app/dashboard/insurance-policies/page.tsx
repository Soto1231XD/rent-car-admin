import Link from "next/link";
import InsurancePoliciesTable from "@/components/insurance-policies/InsurancePoliciesTable";
import { getInsurancePolicies } from "@/lib/api";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function InsurancePoliciesPage({ searchParams }: Props) {
  await searchParams;
  const insurancePolicies = await getInsurancePolicies();

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Pólizas y Smart Tag
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Control de seguros y smart tags por vehículo.
            </p>
          </div>

          <Link
            href="/dashboard/insurance-policies/new"
            className="inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm text-white sm:w-auto"
          >
            Nueva póliza
          </Link>
        </div>
      </div>

      <InsurancePoliciesTable insurancePolicies={insurancePolicies} />
    </div>
  );
}