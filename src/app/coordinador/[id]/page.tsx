import CoordinatorView from "@/components/coordinator/CoordinatorView";

export default async function CoordinatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CoordinatorView orderId={id} />;
}