import ParticipantFlow from "@/components/participant/ParticipantFlow";

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ id: string; token: string }>;
}) {
  const { id, token } = await params;
  return <ParticipantFlow orderId={id} token={token} />;
}