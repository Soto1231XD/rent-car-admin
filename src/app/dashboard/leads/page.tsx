import LeadsTable from "@/components/leads/LeadsTable";
import { getLeads } from "@/lib/api";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Solicitudes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Solicitudes de información recibidas desde el sitio web.
        </p>
      </div>

      <LeadsTable leads={leads} />
    </div>
  );
}
