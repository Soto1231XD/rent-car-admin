import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UnifiedRentalDocumentPage({ params }: Props) {
  const { id } = await params;
  redirect(`/print/rentals/${id}/document`);
}
