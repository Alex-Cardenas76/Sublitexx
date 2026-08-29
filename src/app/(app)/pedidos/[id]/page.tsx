import OrderSection from "@/components/order/OrderSection";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderSection orderId={id} tab="info" />;
}