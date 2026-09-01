import Link from "next/link";
import { notFound } from "next/navigation";
import InsurancePolicyForm from "@/components/insurance-policies/InsurancePolicyForm";
import { getCars, getInsurancePolicies, getInsurancePolicy } from "@/lib/api";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditInsurancePolicyPage({ params }: Props) {
  const { id } = await params;
  const [insurancePolicy, allPolicies, cars] = await Promise.all([
    getInsurancePolicy(id),
    getInsurancePolicies(),
    getCars(),
  ]);

  if (!insurancePolicy) {
    notFound();
  }

  // El formulario es uno solo por vehículo (seguro + Smart Tag juntos), sin
  // importar si se llegó aquí desde el enlace del seguro o del Smart Tag —
  // se buscan ambos registros de ese mismo carro para precargarlos.
  const carPolicies = allPolicies.filter(
    (policy) => policy.carId === insurancePolicy.carId
  );
  const seguro = carPolicies.find((policy) => policy.type === "SEGURO");
  const smartTag = carPolicies.find((policy) => policy.type === "SMART_TAG");

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
          Editar póliza
        </h1>
      </div>

      <InsurancePolicyForm
        mode="edit"
        cars={cars}
        initialData={seguro ?? { carId: insurancePolicy.carId ?? undefined }}
        insurancePolicyId={seguro?.id}
        initialSmartTag={smartTag}
      />
    </div>
  );
}
