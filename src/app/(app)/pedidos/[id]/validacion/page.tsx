import OrderSection from "@/components/order/OrderSection";

export default async function ValidationSection({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderSection orderId={id} tab="validacion" />;
}