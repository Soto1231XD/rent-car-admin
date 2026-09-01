"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import DeleteResourceButton from "@/components/ui/DeleteResourceButton";
import DataTableShell from "@/components/ui/DataTableShell";
import Pagination, { paginate } from "@/components/ui/Pagination";
import { InsurancePolicy } from "@/types/insurance-policy";
import { formatCarLabel } from "@/lib/car-label";

type Props = {
  insurancePolicies: InsurancePolicy[];
};

type CarPolicyRow = {
  carId: string;
  carName: string;
  seguro?: InsurancePolicy;
  smartTag?: InsurancePolicy;
};

export default function InsurancePoliciesTable({ insurancePolicies }: Props) {
  const [carSearch, setCarSearch] = useState("");
  const [page, setPage] = useState(1);

  const hasFilters = carSearch !== "";
  const clearFilters = () => {
    setCarSearch("");
    setPage(1);
  };

  const carRows = useMemo(() => buildCarRows(insurancePolicies), [insurancePolicies]);

  const filteredRows = useMemo(() => {
    return carRows.filter((row) =>
      !carSearch || row.carName.toLowerCase().includes(carSearch.toLowerCase())
    );
  }, [carRows, carSearch]);

  const { pageItems: pagedRows, totalPages, safePage } = paginate(filteredRows, page);

  return (
    <DataTableShell
      filters={
        <input
          type="text"
          placeholder="Buscar por vehículo..."
          value={carSearch}
          onChange={(event) => setCarSearch(event.target.value)}
          className="input md:max-w-sm"
        />
      }
      filteredCount={filteredRows.length}
      totalCount={carRows.length}
      itemLabel="autos con pólizas"
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
      emptyTitle="No se encontraron pólizas"
      emptyDescription="Intenta ajustar el vehículo buscado."
      pagination={
        <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      }
    >
      <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-6 py-4">Vehículo</th>
            <th className="px-6 py-4">Fecha de contrato</th>
            <th className="px-6 py-4">Número de póliza</th>
            <th className="px-6 py-4">Fecha de vigencia</th>
            <th className="px-6 py-4">Compañía</th>
            <th className="px-6 py-4">Teléfono de servicio</th>
            <th className="px-6 py-4">Smart Tag</th>
            <th className="px-6 py-4">Acciones</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {pagedRows.map((row) => (
            <tr key={row.carId} className="transition hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">{row.carName}</td>

              {row.seguro ? (
                <>
                  <td className="px-6 py-4 text-slate-900">
                    {formatDate(row.seguro.contractDate)}
                  </td>
                  <td className="px-6 py-4 text-slate-900">{row.seguro.policyNumber}</td>
                  <td className={`px-6 py-4 ${expirationClass(row.seguro.expirationDate)}`}>
                    {formatDate(row.seguro.expirationDate)}
                  </td>
                  <td className="px-6 py-4 text-slate-900">{row.seguro.company}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {row.seguro.servicePhone || "-"}
                  </td>
                </>
              ) : (
                <td colSpan={5} className="px-6 py-4 text-slate-400">
                  Sin seguro registrado
                </td>
              )}

              <td className={`px-6 py-4 ${row.smartTag ? expirationClass(row.smartTag.expirationDate) : "text-slate-400"}`}>
                {row.smartTag ? formatDate(row.smartTag.expirationDate) : "Sin Smart Tag"}
              </td>

              <td className="px-6 py-4">
                <ActionLinks
                  carId={row.carId}
                  policy={row.seguro ?? row.smartTag}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableShell>
  );
}

function ActionLinks({
  carId,
  policy,
}: {
  carId: string;
  policy?: InsurancePolicy;
}) {
  if (!policy) {
    return (
      <Link
        href={`/dashboard/insurance-policies/new?carId=${carId}`}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        + Agregar póliza
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/dashboard/insurance-policies/${policy.id}/edit`}
        className="text-sm font-medium text-slate-700 hover:underline"
      >
        Editar
      </Link>

      <DeleteResourceButton
        id={policy.id}
        resourceType="insurancePolicy"
        resourceName={policy.company ? `Póliza - ${policy.company}` : "Smart Tag"}
        redirectTo="/dashboard/insurance-policies"
      />
    </div>
  );
}

function buildCarRows(policies: InsurancePolicy[]): CarPolicyRow[] {
  const byCarId = new Map<string, CarPolicyRow>();

  for (const policy of policies) {
    const carId = policy.carId ?? `orphan-${policy.id}`;
    const carName = policy.car ? formatCarLabel(policy.car) : "Vehículo no disponible";

    if (!byCarId.has(carId)) {
      byCarId.set(carId, { carId, carName });
    }

    const row = byCarId.get(carId) as CarPolicyRow;

    if (policy.type === "SEGURO") {
      if (!row.seguro || policy.expirationDate > row.seguro.expirationDate) {
        row.seguro = policy;
      }
    } else if (!row.smartTag || policy.expirationDate > row.smartTag.expirationDate) {
      row.smartTag = policy;
    }
  }

  return Array.from(byCarId.values()).sort((a, b) => a.carName.localeCompare(b.carName));
}

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : "-";
}

function isExpired(expirationDate: string) {
  return expirationDate.slice(0, 10) < new Date().toISOString().slice(0, 10);
}

// Matches the backend's POLICY_EXPIRATION_WARNING_DAYS threshold, so the
// highlight lines up with what triggers the sidebar bubble and email.
function isExpiringSoon(expirationDate: string) {
  const warningThreshold = new Date();
  warningThreshold.setDate(warningThreshold.getDate() + 2);

  return new Date(expirationDate) <= warningThreshold;
}

function expirationClass(expirationDate: string) {
  if (isExpired(expirationDate)) {
    return "font-semibold text-red-600";
  }

  if (isExpiringSoon(expirationDate)) {
    return "font-semibold text-amber-600";
  }

  return "text-slate-900";
}
