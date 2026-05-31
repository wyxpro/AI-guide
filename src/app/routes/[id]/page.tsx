import { RouteDetailScreen } from "@/components/screens/RouteDetailScreen";

export default async function RouteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RouteDetailScreen routeId={id} />;
}
