import MembershipForm from "@/components/memberships/MembershipForm";
import { getClients } from "@/lib/api";

export default async function NewMembershipPage() {
  const clients = await getClients();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Nueva membresía</h1>
        <p className="mt-1 text-sm text-slate-600">
          Elige un cliente y el tipo de renovación para generar su link de
          pago de Mercado Pago.
        </p>
      </div>

      <MembershipForm clients={clients} />
    </div>
  );
}
